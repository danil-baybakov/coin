export class InvalidAuth extends Error {
  name = 'InvalidAuth';
}
export class ErrorAuth extends Error {
  name = 'ErrorAuth';
}
export class ErrorGetAccount extends Error {
  name = 'ErrorGetAccount';
}
export class InvalidTransfer extends Error {
  name = 'InvalidTransfer';
}
export class ErrorTransfer extends Error {
  name = 'ErrorTransfer';
}
export class ErrorCoinExchange extends Error {
  name = 'ErrorCoinExchange';
}

// авторизация пользователя
export async function authorization(data) {
  const errors = [];

  if (!data.login) {
    errors.push({
      name: 'login',
      message: 'Логин не введен.',
    });
  } else if (data.login.includes(' ')) {
    errors.push({
      name: 'login',
      message: 'Логин не должен содержать пробелы.',
    });
  } else if (data.login.length < 6) {
    errors.push({
      name: 'login',
      message: 'Длинна логина не может быть меньше 6 символов.',
    });
  }

  if (!data.password) {
    errors.push({
      name: 'password',
      message: 'Пароль не введен.',
    });
  } else if (data.password.includes(' ')) {
    errors.push({
      name: 'password',
      message: 'Пароль не должен содержать пробелы.',
    });
  } else if (data.password.length < 6) {
    errors.push({
      name: 'password',
      message: 'Длинна пароля не может быть меньше 6 символов.',
    });
  }

  if (errors.length) {
    const err = new InvalidAuth();
    err.errors = errors;
    throw err;
  }

  const response = await fetch(`http://localhost:3000/login`, {
    method: 'POST',
    body: JSON.stringify({
      login: data.login,
      password: data.password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();
  if (result.error) {
    const err = new ErrorAuth();
    err.error = {
      name: 'submit',
      message:
        result.error === 'Invalid password'
          ? 'Пытаемся войти с неверным паролем'
          : 'Такой пользователь не зарегестрирован.',
    };
    throw err;
  }

  return result;
}

// функция возвращает список счетов пользователя.
export async function getAccounts(token) {
  const response = await fetch(`http://localhost:3000/accounts`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();
  return result;
}

// функция возвращает подробную информацию о счёте пользователя
// id - номер счёта.
export async function getAccount(token, id) {
  const response = await fetch(`http://localhost:3000/account/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();

  if (result.error) {
    throw new ErrorGetAccount();
  }

  return result;
}

// функция создаёт для пользователя новый счёт
export async function createAccount(token) {
  const response = await fetch(`http://localhost:3000/create-account`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();
  return result;
}

// функция перевода средств со счёта на счёт
// from - счёт с которого списываются средства
// to - счёт, на который зачисляются средства
// amount - сумма для перевода
export async function transferFunds(token, from, to, amount) {
  const err = new InvalidTransfer();
  if (!from || !to || !amount) {
    if (!from) {
      err.errorMessages = {
        name: 'submit',
        message:
          'Не указан адрес счёта списания, или этот счёт не принадлежит нам',
      };
      throw err;
    } else if (!to) {
      err.errorMessages = {
        name: 'number',
        message: 'Не указан счёт зачисления, или этого счёта не существует',
      };
      throw err;
    } else if (!amount) {
      err.errorMessages = {
        name: 'amount',
        message: 'Не указана сумма перевода, или она отрицательная',
      };
      throw err;
    }
  }

  const response = await fetch(`http://localhost:3000/transfer-funds`, {
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      amount,
    }),
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();

  if (result.error) {
    if (result.error === 'Invalid account from') {
      err.errorMessages = {
        name: 'submit',
        message:
          'Не указан адрес счёта списания, или этот счёт не принадлежит нам',
      };
    } else if (result.error === 'Invalid account to') {
      err.errorMessages = {
        name: 'number',
        message: 'Не указан счёт зачисления, или этого счёта не существует',
      };
    } else if (result.error === 'Invalid amount') {
      err.errorMessages = {
        name: 'amount',
        message: 'Не указана сумма перевода, или она отрицательная',
      };
    } else if (result.error === 'Overdraft prevented') {
      err.errorMessages = {
        name: 'amount',
        message:
          'Мы попытались перевести больше денег, чем доступно на счёте списания',
      };
    }
    throw err;
  }

  return result;
}

// функция возвращает массив со списком кодов всех используемых бекэндом валют на данный момент
export async function allCurrencies() {
  const response = await fetch(`http://localhost:3000/all-currencies`);

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();

  return result;
}

// функция возвращает список валютных счетов текущего пользователя
export async function getListCurrencies(token) {
  const response = await fetch(`http://localhost:3000/currencies`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();
  return result;
}

// функция совершения валютного обмена
// from - код валютного счёта, с которого списываются средства
// to - код валютного счёта, на который зачисляются средства
// amount - сумма, которая списывается, конвертация вычисляется сервером автоматически, исходя из текущего валютного курса для данной валютной пары
export async function currencyBuy(token, from, to, amount) {
  const response = await fetch(`http://localhost:3000/currency-buy`, {
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      amount,
    }),
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();
  if (result.error || !amount) {
    const err = new ErrorCoinExchange();
    if (result.error === 'Unknown currency code') {
      err.messages = {
        name: 'invalidCode',
        message:
          'Передан неверный валютный код, код не поддерживается системой (валютный код списания или валютный код зачисления).',
      };
    } else if (result.error === 'Invalid amount' || !amount) {
      err.messages = {
        name: 'invalidAmount',
        message: 'Не указана сумма перевода, или она отрицательная.',
      };
    } else if (result.error === 'Not enough currency') {
      err.messages = {
        name: 'notCurrency',
        message: 'На валютном счёте списания нет средств.',
      };
    } else if (result.error === 'Overdraft prevented') {
      err.messages = {
        name: 'overdraftPrevented',
        message: 'Попытка перевести больше, чем доступно на счёте списания.',
      };
    }
    throw err;
  }

  return result;
}

// функция возвращает список точек, отмечающих места банкоматов
export async function getBanks() {
  const response = await fetch(`http://localhost:3000/banks`);

  if (!response.ok) {
    throw new Error();
  }

  const result = await response.json();
  return result;
}

// функция подключения к websocket-стриму, который будет выдавать сообщения об изменении курса обмена валют.
export function wsConnCurrencyFeed() {
  const socket = new WebSocket('ws://localhost:3000/currency-feed');
  return socket;
}
