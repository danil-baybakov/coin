export class InvalidAuth extends Error {
  name = 'InvalidAuth';
}
export class ErrorAuth extends Error {
  name = 'ErrorAuth';
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
    err.errorMessages = errors;
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

  if (response.ok) {
    const result = await response.json();
    if (!result.payload) {
      const err = new ErrorAuth();
      err.errorMessages = {
        name: 'authUserOff',
        message: 'Такой пользователь не зарегестрирован.',
      };
      throw err;
    }
    return result;
  } else {
    const err = new ErrorAuth();
    err.errorMessages = {
      name: 'errorServer',
      message: 'Ошибка связи с сервером.',
    };
    throw err;
  }
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
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
}

// функция перевода средств со счёта на счёт
// from - счёт с которого списываются средства
// to - счёт, на который зачисляются средства
// amount - сумма для перевода
export async function transferFunds(token, from, to, amount) {
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
  const data = await response.json();
  return data;
}

// функция возвращает массив со списком кодов всех используемых бекэндом валют на данный момент
export async function allCurrencies(token) {
  const response = await fetch(`http://localhost:3000/all-currencies`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
}

// функция возвращает список точек, отмечающих места банкоматов
export async function getBanks(token) {
  const response = await fetch(`http://localhost:3000/banks`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
}
