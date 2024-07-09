import { el, setChildren, mount } from 'redom';
import { getAccount, transferFunds } from './server.js';
import { renderElement, autoComplite, lableMonth } from './auxiliary.js';
import Inputmask from 'inputmask';
import Chart from 'chart.js/auto';
import Swiper from '../resource/swiper/js/swiper-bundle.min.js';
import SimpleBar from '../resource/simplebar/js/simplebar.min.js';
import { appSpinner } from './spinner.js';
import { appMessage } from './message.js';

//////////////////////////////////////////////////////////////////////////////////////////
// функция возвращает список истории переводов обычный и
// по месяцам в обратном порядке
function analizeTransactions(account, range = 6) {
  // номер счета
  const id = account.payload.account;
  // текущий баланс
  const currentBalance = account.payload.balance;
  // исходный список истории переводов
  const transactions = account.payload.transactions;

  // инициалиация списка истории переводов по месяцам в обратном порядке
  const transactionsMonths = [];
  // получаем текущую дату
  const currentDate = new Date();
  // получаем текущий год
  let year = currentDate.getFullYear();
  // получаем текущий месяц
  let month = currentDate.getMonth();
  let count = range;
  // формируем список истории переводов по месяцам в обратном порядке
  // пока без данных - с нулевыми значениями
  while (count > 0) {
    transactionsMonths.unshift({
      date: `${year}-${month}`,
      amount: 0, // сумма переводов за месяц общая
      amountFrom: 0, // сумма переводов за месяц входящая
      amountTo: 0, // сумма переводов за месяц исходящая
      balance: 0, // текущий балансе за месяц
    });
    month -= 1;
    if (month < 0) {
      year -= 1;
      month = 11;
    }
    count--;
  }

  // если исодный список истории переводов не пустой
  if (transactions.length > 0 && transactionsMonths.length > 0) {
    // проходимся по каждому элементу исодного списка истории переводов
    transactions.map((trs) => {
      // получаем год перевода
      const year = new Date(trs.date).getFullYear();
      // получаем месяц перевода
      const month = new Date(trs.date).getMonth();

      // заполняем поле amount, amountTo, amountFrom элемента списка истории переводов по месяцам в обратном порядке
      transactionsMonths.forEach((item) => {
        const date = item.date.split('-');
        if (year === Number(date[0]) && month === Number(date[1])) {
          if (trs.from === id) {
            item.amount -= trs.amount;
            item.amountFrom += trs.amount;
          } else {
            item.amount += trs.amount;
            item.amountTo += trs.amount;
          }
        }
      });
    });

    // заполняем поле balance элемента списка истории переводов по месяцам в обратном порядке
    let balanceMonth = currentBalance;
    for (let i = transactionsMonths.length - 1; i >= 0; --i) {
      transactionsMonths[i].balance = balanceMonth;
      transactionsMonths[i].balance = Number(
        transactionsMonths[i].balance.toFixed(2),
      );
      balanceMonth -= transactionsMonths[i].amount;
      transactionsMonths[i].amount = Number(
        transactionsMonths[i].amount.toFixed(2),
      );
    }
  }

  // возвращаем
  // исходный список истории переводов - transactions
  // список истории переводов по месяцам в обратном порядке - transactionsMonths
  return { transactions, transactionsMonths };
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция создает html-элемент вернего поля вывода общей информации
function createAccountHeader(account) {
  // создаем элемент
  const element = el('div.account__header.flex-column-st-st');

  // создаем обертку - верхний блок
  const top = el('div.account__header-top.flex-row-sb-st');
  // создаем заголовок
  const title = el('h2.account__header-top-title.gap-reset.title');

  // создаем кнопку Вернуться назад
  // создаем кнопку
  const btn = el(
    'button.account__header-btn.btn.link-reset.btn-fill.btn-fill-icon',
    {
      id: 'btnCreateAccount',
      type: 'button',
    },
  );
  // создаем иконку для кнопки
  const btnIcon = el('span.account__header-btn-icon.btn-fill__icon');
  btnIcon.innerHTML = `<svg class="account__header-btn-svg btn-fill__svg"
                                    width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.83 5L7.41 1.41L6 0L0 6L6 12L7.41 10.59L3.83 7L16 7V5L3.83 5Z" fill="white"/>
                                </svg>`;
  // создаем элемент с текстом
  const btnText = el(
    'span.account__header-btn-text.btn-fill__text',
    'Вернуться назад',
  );
  // помещаем иконку и текст в кнопку
  setChildren(btn, btnIcon, btnText);

  // вешаем обработчик клика по кнопке
  btn.addEventListener('click', async (event) => {
    // отключаем действия браузера по умолчанию
    event.preventDefault();
    // смотрим путь из URL
    const pathName = location.pathname;
    // если мы наодимся на странице информации о существующей карте
    if (pathName == '/account-view') {
      // именяем URL
      history.pushState(null, '', '/accounts');
      // переходим на страницу со списком счетов пользователя
      renderElement('user', document.querySelector('#appContainer'));
      // если мы наодимся на странице подробного просмотра истории баланса
    } else if (pathName == '/account-history') {
      // именяем URL
      history.pushState(
        null,
        '',
        `/account-view?id=${account.payload.account}`,
      );
      // переходим на страницу информации о существующей карте
      renderElement('account', document.querySelector('#appContainer'), {
        id: account.payload.account,
        page: 'view',
      });
    }
  });

  // помещаем заголовок и номер счета в верхний блок
  setChildren(top, title, btn);

  // создаем обертку - нижний блок
  const bottom = el('div.account__header-bottom.flex-row-sb-ct');

  // создаем номер счета
  const id = el(
    'p.account__header-bottom-text.account-text.gap-reset',
    `№ ${account.payload.account}`,
  );

  // создаем элемент отображения баланса
  // создаем обертку
  const balanceWrapper = el('div.account__header-balance');
  // создаем элемент с наименованием
  const balanceLable = el(
    'span.account__header-balance-lable.title-card',
    'Баланс',
  );
  // формат вывода значений осу Y
  const formatterBalance = new Intl.NumberFormat('ru', {
    style: 'decimal',
  });
  // создаем элемент со значением
  const balance = el(
    'span.account__header-balance-text.ruble',
    `${formatterBalance.format(Number(account.payload.balance))}`,
  );
  // помещем наименовние и значение в обертку
  setChildren(balanceWrapper, balanceLable, balance);

  // помещаем все в нижний блок
  setChildren(bottom, id, balanceWrapper);

  // помещаем верхний и нижний блок в основной элемент
  setChildren(element, top, bottom);

  // вовращаем объект с:
  // основным элементом
  // заголовоком
  // балансом
  // кнопкой
  return { element, title, balance, btn };
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция создает html-элемент формы перевода денег
function renderAccountTransfer(rootElement, account, balance) {
  rootElement.innerHTML = '';
  let autocompleteList = []; // список испольовавшися счетов из SessionStorage

  // извлекаем список испольовавшися счетов из SessionStorage если есть такие
  if (sessionStorage.getItem('transferHistory')) {
    autocompleteList = JSON.parse(sessionStorage.getItem('transferHistory'));
  }

  // содаем контейнер формы перевода денег
  const element = el('div.transfer');

  // содаем и добавляем в контейнер саму форму перевода денег
  const form = el('form.transfer__form', {
    id: 'transferForm',
  });

  // создаем заголовок формы перевода денег
  const groupTitle = el('div.transfer__form-group.form__group');
  const title = el(
    'h2.transfer__form-title.title-card.gap-reset',
    'Новый перевод',
  );
  setChildren(groupTitle, title);

  // содаем поле ввода номера счета для отправки денег
  const groupNumber = el('div.transfer__form-group.form__group');
  const labelNumber = el(
    'label.transfer__form-label.form__label',
    'Номер счета получателя',
  );
  const inputNumber = el('input', {
    type: 'text',
    placeholder: '',
    autocomplete: 'off',
  });
  setChildren(groupNumber, labelNumber, inputNumber);
  autoComplite(inputNumber, autocompleteList, 'transfer', 'number');
  Inputmask('9{1,30}').mask(inputNumber);

  // создаем поле ввода суммы перевода
  const groupAmount = el('div.transfer__form-group.form__group');
  const labelAmount = el(
    'label.transfer__form-label.form__label',
    'Сумма перевода',
  );
  const wrapInputAmount = el('div.transfer__form-input-wrapper.input-wrapper');
  const inputAmount = el('input.transfer__form-input.input', {
    type: 'text',
  });
  inputAmount.dataset.name = 'amount';
  const messageAmount = el(
    'span.transfer__form-message.input__message',
    'Ошибка',
  );
  messageAmount.dataset.name = 'amountMessage';
  setChildren(wrapInputAmount, inputAmount, messageAmount);
  setChildren(groupAmount, labelAmount, wrapInputAmount);
  Inputmask('9{1,20}[.9{1,20}] ₽').mask(inputAmount);

  // создаем кнопку отправки запроса на перевод денег
  const groupBtn = el('div.transfer__form-group.form__group');
  const btn = el(
    'button.transfer__form-btn.btn.link-reset.btn-fill.btn-fill-icon',
    {
      type: 'submit',
    },
  );
  btn.dataset.name = 'submit';
  const btnIcon = el('span.transfer__form-btn-icon.btn-fill__icon');
  btnIcon.innerHTML = ` <svg class="transfer__form-btn-svg btn-fill__svg" width="24" height="24"
                            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 20H4C2.89543 20 2 19.1046 2 18V5.913C2.04661 4.84255 2.92853
                            3.99899 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20ZM4
                            7.868V18H20V7.868L12 13.2L4 7.868ZM4.8 6L12 10.8L19.2 6H4.8Z" fill="white"/>
                        </svg>`;
  const btnText = el(
    'span.transfer__form-btn-text.btn-fill__text',
    'Отправить',
  );
  const messageBtn = el('span.transfer__form-message.btn__message', 'Ошибка');
  messageBtn.dataset.name = 'submitMessage';
  setChildren(btn, btnIcon, btnText);
  setChildren(groupBtn, btn, messageBtn);

  // создаем полностью итоговый html-элемент формы перевода денег
  setChildren(element, form);
  setChildren(form, groupTitle, groupNumber, groupAmount, groupBtn);

  // обработчик события нажатия на кнопку запроса перевода денег
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const data = {};
    const inputs = {};
    const messeges = {};

    // отображаем спиннер
    appSpinner.show();

    // убираем инф окно
    appMessage.hide();

    // получаем список инпутов формы с соответствующими элеиентами вывода сообщений
    for (let i = 0; i < form.elements.length; ++i) {
      const input = form[i];
      if (!input.hasAttribute('data-name')) continue;
      const message = input.nextElementSibling;
      input.value = input.value.trim();
      data[input.dataset.name] = input.value;
      inputs[input.dataset.name] = input;
      messeges[message.dataset.name] = message;

      input.classList.remove('is-message', 'is-invalid', 'is-success');
      message.classList.remove('message-error', 'message-success');
      message.textContent = '';

      // обработчик события ввода значения в поля ввода формы
      // по этому событию убираем все сообщения
      input.addEventListener('input', () => {
        input.classList.remove('is-message', 'is-invalid', 'is-success');
        message.classList.remove('message-error', 'message-success');
        message.textContent = '';
      });
    }

    // очищаем форму при клике на любое место кроме формы
    form.addEventListener('click', (event) => {
      event._isClickForm = true;
    });
    window.addEventListener('click', (event) => {
      if (event._isClickForm) return;
      ['number', 'amount', 'submit'].map((name) => {
        inputs[name].classList.remove('is-message', 'is-invalid', 'is-success');
        messeges[`${name}Message`].classList.remove(
          'message-error',
          'message-success',
        );
        messeges[`${name}Message`].textContent = '';
      });
    });

    try {
      const token = sessionStorage.getItem('token'); // токен
      const from = account.payload.account; // счет откуда будет выполнен перевод
      const to = inputNumber.value; // счет куда будет выполнен перевод
      const amount = Number(inputAmount.value.slice(0, -2)); // сумма перевода
      // запрос на сервер для перевода денег
      const resonse = await transferFunds(token, from, to, amount);

      // убираем спиннер
      appSpinner.hide();
      // убираем инф сообщение
      appMessage.hide();

      // апоминаем в SessionStorage номер счета куда была проиведена транзакцияы
      if (!autocompleteList.includes(to)) {
        autocompleteList.push(to);
        sessionStorage.setItem(
          'transferHistory',
          JSON.stringify(autocompleteList),
        );
      }
      // в верней панели обновляем баланс счета
      balance.textContent = `${Number(resonse.payload.balance.toFixed(2))}`;
      renderAccountChart(document.getElementById('accountChart'), resonse);
      renderAccountHistoryTransfer(
        document.getElementById('accountHistoryTransfer'),
        resonse,
      );
      // выводим сообщение что операция прошла успешно и очищем все поля формы
      inputs['submit'].classList.add('is-message');
      messeges['submitMessage'].classList.add('message-success');
      messeges['submitMessage'].textContent = 'Операция прошла успешно';
      setTimeout(() => {
        inputs['number'].value = '';
        inputs['amount'].value = '';
        inputs['submit'].classList.remove('is-message');
        messeges['submitMessage'].classList.remove('message-success');
        messeges['submitMessage'].textContent = '';
      }, 1000);
    } catch (err) {
      // убираем спиннер загрузки
      appSpinner.hide();

      //  вывод ошибок вылидации формы
      if (err.name === 'InvalidTransfer') {
        inputs[err.errorMessages.name].classList.add(
          'is-message',
          'is-invalid',
        );
        messeges[`${err.errorMessages.name}Message`].classList.add(
          'message-error',
        );
        messeges[`${err.errorMessages.name}Message`].textContent =
          err.errorMessages.message;
      } else {
        inputs['submit'].classList.add('is-message', 'is-invalid');
        messeges['submitMessage'].classList.add('message-error');
        if (err.name === 'ErrorTransfer') {
          messeges['submitMessage'].textContent = err.error.message;
        } else {
          // показываем инф окно
          appMessage.show();
          // отобрааем текст сообщения
          appMessage.text.textContent = 'Ошибка свяи с сервером.';
        }
      }
    }
  });

  setChildren(rootElement, element);

  // вывод итогового html-элемента формы перевода денег
  return element;
}
////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовывает график динамики баланса и соотношения входящих/исходящих транзакций
// type - тип:    тип 1 - false - выводит график динамики баланса;
//                тип 2 - true - выводит график соотношения входящих и исходящих транзакций
// range - диапаpон вывода в месяцах
// widthScreenAxixYLeft - размер экрана при котором ось Y будет отрисовываться слева, по умолчанию справа
function renderAccountChart(
  rootElement,
  account,
  range = 6,
  type = false,
  widthScreenAxixYLeft = 1200,
) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';

  // создаем блок вывода графика
  const element = el('div.chart', { id: 'chartContainer' });
  // создаем заголовок
  const title = el(
    'h2.chart__title.title-card.gap-reset',
    !type ? 'Динамика баланса' : 'Соотношение входящих и исходящих транакций',
  );
  // создаем контейнер графика
  const cartContainer = el('div.chart__container');
  // создаем контейнер графика
  const cartWrapper = el('div.chart__wrapper');
  // создаем элемент отображения графика
  const chart = el('canvas.chart__canvas');
  // помещаем обертку графика в контейнер
  setChildren(cartContainer, cartWrapper);
  // помещаем элемент отображения графика в обертку
  setChildren(cartWrapper, chart);
  // помещаем все созданные элементы в блок вывода графика
  setChildren(element, title, cartContainer);

  // получаем список истории переводов разбитый по месяцам
  const trsMonths = analizeTransactions(account, range).transactionsMonths;

  // создаем список меток значений гистограммы ( список наименований мясяцов)
  const arrLabel = [];
  trsMonths.forEach((item) => {
    const ym = item.date.split('-');
    arrLabel.push(lableMonth[ym[1]]);
  });

  // формируем списки значений по месяцам
  const trsMonthsBalance = []; // список динамики баланса помесячно
  const trsMonthsAmountFrom = []; // список сумм исходящих транзакции помесячно
  const trsMonthsAmountTo = []; // список сумм входящих транзакции помесячно
  trsMonths.forEach((item) => {
    trsMonthsBalance.push(item.balance);
    trsMonthsAmountTo.push(item.amountTo);
    trsMonthsAmountFrom.push(item.amountFrom);
  });

  // в зависимости от типа формируем наборы данных
  let datasets = [];
  // для графика динамики баланса;
  if (!type) {
    datasets = [
      {
        label: 'Баланс за месяц', // метка
        data: trsMonthsBalance, // данные
        backgroundColor: '#116ACC', // цвет гистограммы
      },
    ];
    // для графика соотношения входящих и исходящих транзакций
  } else {
    datasets = [
      {
        label: 'Исхлдящие транзакции', // метка
        data: trsMonthsAmountFrom, // данные - сумма вх транзакции помесячно
        backgroundColor: '#FD4E5D', // цвет гистограммы
        grouped: false, // групировка в один столбец
      },
      {
        label: 'Входящие транзакции', // метка
        data: trsMonthsAmountTo, // данные - сумма исх транзакции помесячно
        backgroundColor: '#76CA66', // цвет гистограммы
        grouped: false, // групировка в один столбец
      },
    ];
  }

  // устанавливаем размер шрифта
  Chart.defaults.font.size = 16;
  // устанавливаем шрифт
  Chart.defaults.font.family = `'WorkSans', sans-serif`;

  // настраиваем плагин для отобраения поля гистограммы в рамке
  const chartAreaBorder = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
      const {
        ctx,
        chartArea: { left, top, width, height },
      } = chart;
      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.setLineDash(options.borderDash || []);
      ctx.lineDashOffset = options.borderDashOffset;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    },
  };

  // формат вывода значений осу Y
  let formatter = new Intl.NumberFormat('ru', {
    style: 'decimal',
  });

  // создаем график
  const myChart = new Chart(chart, {
    type: 'bar', // тип - гистограмма
    plugins: [chartAreaBorder], // добавляем плагин для отображения поля гистограммы в рамке
    options: {
      responsive: true, // график авто подстраивается под размер холста
      maintainAspectRatio: false, // изменяет размеры без сохранения пропорций
      animation: false, // отключаем анимацию
      events: [], // отключаем все обработчики события
      scales: {
        x: {
          // настройка оси X
          ticks: {
            color: 'black', // цвет
            // шрифт
            font: {
              weight: 700,
            },
          },
          grid: {
            display: false, // убираем сетку
          },
        },
        y: {
          // настройка оси Y
          beginAtZero: true,
          position: screen.width < widthScreenAxixYLeft ? 'left' : 'right', // позиция - справа
          ticks: {
            color: 'black', // цвет
            // шрифт
            font: {
              weight: 500,
              color: 'red',
            },
            // форматируем вывод значений
            callback: (value, index, values) =>
              index > 0 && index < values.length - 1
                ? ''
                : formatter.format(
                    Math[index ? 'max' : 'min'](
                      ...values.map((n) => n.value),
                    ).toFixed(2),
                  ) + ' \u20BD',
          },
          grid: {
            display: false, // убираем сетку
          },
        },
      },
      // настройки плагинов
      plugins: {
        // плагин для отобраения легенды
        legend: {
          display: false, // убираем легенду
        },
        // плагин для отобраения тултипов
        tooltip: {
          enabled: false, // убираем тултипы
        },
        // плагин для отображения поля гистограммы в рамке
        chartAreaBorder: {
          borderColor: 'black', // цвет рамки
          borderWidth: 1, // ширина рамки
        },
      },
    },
    // настраиваем набор данны
    data: {
      labels: arrLabel,
      datasets: datasets,
    },
  });

  window.addEventListener('resize', () => {
    let viewport = screen.width;
    if (viewport < widthScreenAxixYLeft) {
      myChart.options.scales.y.position = 'left';
    } else {
      myChart.options.scales.y.position = 'right';
    }
    myChart.update();
  });

  // помещаем все в корневой элемент
  setChildren(rootElement, element);

  // возвращаем итоговый результат
  return element;
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки строк таблицы истории переводов
function renderTransferList(rootElement, transferList, idAccount) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';
  // проходимся циклом по сптску истории переводов
  transferList.forEach((item) => {
    // приводим к нужному формату поле Дата
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('ru-RU');

    // приводим к нуному формату поле Сумма
    const formattedAmount =
      idAccount === item.from ? -item.amount : item.amount;
    const addClassAmount = idAccount === item.from ? 'price-to' : 'price-from';

    // содаем строку в таблицу
    const row = el(
      'tr.history-transfer__table-tbody-tr.table__tbody-tr',
      {
        id: `tr_${item.id}`,
      },
      [
        // создаем ячейку Счет отправителя
        el(
          'td.history-transfer__table-tbody-td.table__tbody-td',
          `${item.from}`,
          {
            id: `tdFrom_${item.id}`,
          },
        ),
        // создаем ячейку Счет получателя
        el(
          'td.history-transfer__table-tbody-td.table__tbody-td',
          `${item.to}`,
          {
            id: `tdTo_${item.id}`,
          },
        ),
        // создаем ячейку Сумма
        el(
          `td.history-transfer__table-tbody-td.table__tbody-td.ruble.${addClassAmount}`,
          `${formattedAmount}`,
          {
            id: `tdAmount_${item.id}`,
          },
        ),
        // создаем ячейку Дата
        el(
          'td.history-transfer__table-tbody-td.table__tbody-td',
          `${formattedDate}`,
          {
            id: `tdDate_${item.id}`,
          },
        ),
      ],
    );
    // добавляем строку в таблицу
    mount(rootElement, row);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки таблицы истории переводов
// many - режим:  режим 1 - false - выводит таблицу из 10 (или менее) записей;
//                режим 2 - true - выводит таблицу из 25 (или менее) записей, если больше 25 записей вводим меаним постраничного отобраения
function renderAccountHistoryTransfer(rootElement, account, many = false) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';

  // максимальное кол-во отображаемых записей
  let range = !many ? 10 : 25;

  // создаем главный элемент
  const element = el('div.history-transfer');

  // создаем заголовок таблицы
  const title = el(
    'h2.history-transfer__title.title-card.gap-reset',
    'История переводов',
  );

  // создаем контейнер для таблицы - таблица1 + таблица2
  const container = el('div.history-transfer__container.table__container');

  // создаем обертку для таблицы - таблица1 + таблица2
  const tableWrapper1 = el('div.history-transfer__wrapper.table__wrapper-main');

  // таблица 1 отображения заголовков
  // создаем таблицу
  const table1 = el('table.history-transfer__table.table');
  // создаем тело таблицы
  const tableHeader = el('thead.history-transfer__table-thead.table__thead', [
    el('tr.history-transfer__table-thead-tr.table__thead-tr', [
      // заголовок - Счет отправителя
      el(
        'th.history-transfer__table-thead-th.table__thead-th',
        'Счет отправителя',
      ),
      // заголовок - Счет получателя
      el(
        'th.history-transfer__table-thead-th.table__thead-th',
        'Счет получателя',
      ),
      // заголовок - Сумма
      el('th.history-transfer__table-thead-th.table__thead-th', 'Сумма'),
      // заголовок - Дата
      el('th.history-transfer__table-thead-th.table__thead-th', 'Дата'),
    ]),
  ]);
  // помещаем тело в таблицу
  setChildren(table1, tableHeader);

  // таблица 2 отображения данных
  // создаем обертку
  const wrapperTable2 = el('div.history-transfer__container.table__wrapper');
  // создаем таблицу
  const table2 = el('table.history-transfer__table.table');
  // помещаем в обертку таблицу
  setChildren(wrapperTable2, table2);
  // создаем тело таблицы
  const tableBody = el('tbody.history-transfer__table-tbody.table__tbody');
  // помещаем тело в таблицу
  setChildren(table2, tableBody);

  // список переводов
  const transactionsListFull = account.payload.transactions;
  // номер счета
  const idAccount = account.payload.account;
  // список отобрааемых в таблице переводов - первый с конца - инициализация
  let transferList = [];

  // формируем массив для отрисовки переводов в таблице
  // если есть переводы
  if (transactionsListFull.length > 0) {
    let count = 0;
    let index = transactionsListFull.length;
    // если режим 1
    if (!many) {
      // из истории переводов формирую массив не более 10 элементов
      // в обратном порядке
      while (count < range && index > 0) {
        index = transactionsListFull.length - count - 1;
        transferList.push({ id: `0_${count}`, ...transactionsListFull[index] });
        count += 1;
      }
      // отрисовываем в таблице 10 (или менее) последних записей начиная с конца
      renderTransferList(tableBody, transferList, idAccount);
      // если режим 2
    } else {
      let count2 = 0;
      let part = 0;
      transferList.push([]);
      // из истории переводов формирую
      // массив из массивов по 25 элементов
      // в обратном порядке
      while (index > 0) {
        index = transactionsListFull.length - count - 1;
        transferList[part].push({
          id: `${part}_${count2}`,
          ...transactionsListFull[index],
        });
        if (count2 >= 25) {
          count2 = 0;
          part += 1;
          transferList.push([]);
        } else {
          count2 += 1;
        }
        count += 1;
      }
      // отрисовываем в таблице первые 25 последних записей начиная с конца
      renderTransferList(tableBody, transferList[0], idAccount);
    }
  }

  // помещаем главную обертку в контейнер
  setChildren(container, tableWrapper1);
  // помещаем в обертку таблицы 1 и 2
  setChildren(tableWrapper1, table1, wrapperTable2);
  // помещаем в главный элемент заголовок и контейнер таблиц
  setChildren(element, title, container);

  // если есть переводы и режим 2
  if (transferList.length > 0 && many) {
    // ......................
    // нумерация перелистывания страниц - в ввиде свайпера
    // создаем обертку свайпера
    const swiperContainer = el(
      'div.history-transfer__swiper-container.swiper-container',
    );
    // создаем свайпер
    const swiper = el('div.history-transfer__swiper.swiper');
    // оборачиваем свайпер
    setChildren(swiperContainer, swiper);

    // создаем обертку для элементов свайпера
    const swiperWrapper = el(
      'div.history-transfer__swiper-wrapper.swiper-wrapper',
    );
    // помещаем обертку для элементов свайпера в свайпер
    setChildren(swiper, swiperWrapper);

    // создаем кнопку для перелистывания свайпера вперед
    const swiperBtnNext = el(
      'div.history-transfer__swiper-button-next.swiper-button-next',
    );
    // создаем кнопку для перелистывания свайпера назад
    const swiperBtnPrev = el(
      'div.history-transfer__swiper-button-prev.swiper-button-prev',
    );
    // ......................

    // циклом проходимся по списку переводов
    for (const key in transferList) {
      // создаем слайд свайпера
      const swiperSlide = el('div.history-transfer__swiper-slide.swiper-slide');
      // создаем кнопку с номером страницы
      const swiperBtn = el(
        'button.history-transfer__swiper-btn.swiper-btn.btn-reset',
        `${Number(key) + 1}`,
      );
      // вешаем обработчик события клика по кнопке с номером страницы
      // для переключения страниц
      swiperBtn.addEventListener('click', (event) => {
        event.preventDefault();
        // по событию отрисовываем нужную страницу в таблице
        renderTransferList(tableBody, transferList[key], idAccount);
      });
      // помещаем кнопку в слайд
      setChildren(swiperSlide, swiperBtn);
      // помещаем слайд в обертку свайпера
      mount(swiperWrapper, swiperSlide);
    }

    // помещаем в главный элемент свайпер нумерации перелистывания страниц
    mount(element, swiperContainer);

    // если кол-во переводов больше 25*6
    if (transferList.length > (screen.width < 576 ? 3 : 6)) {
      // из обертки свайпера удаляем класс который позволяет обойтись без свайпера
      swiperWrapper.classList.remove('short-list');
      // в свайпер добавляем кнопку перелистывания вперед
      mount(swiperContainer, swiperBtnPrev);
      // в свайпер добавляем кнопку перелистывания назад
      mount(swiperContainer, swiperBtnNext);

      // инициалиируем свайпер
      const objSwiper = new Swiper(swiper, {
        direction: 'horizontal', // направление - горионтальное
        width: 40, // ширина слайда
        height: 40, // высота слайда
        spaceBetween: 5, // расстояние между слайдами в пикселях
        slidesPerGroup: screen.width < 576 ? 3 : 6, // группируем слайды по 6 шт
        // разрешаем использование кнопок навигации
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
      // вещаем обработчик события клика по кнопке перелистывания вперед
      swiperBtnNext.addEventListener('click', () => objSwiper.slideNext());
      // вещаем обработчик события клика по кнопке перелистывания назад
      swiperBtnPrev.addEventListener('click', () => objSwiper.slidePrev());
    } else {
      // в обертку свайпера добавляем класс который поволяет обойтись без свайпера
      swiperWrapper.classList.add('short-list');
    }
  }

  // инициалиация кастомного скролла
  new SimpleBar(wrapperTable2, {
    autoHide: true,
  });

  // помещаем все в корневой элемент
  setChildren(rootElement, element);

  // вовращаем итоговый элемент
  return element;
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки блока информации о существующей карте
function renderAccountView(rootElement, account, title, balance) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';
  // меняем заголовок страницы
  title.textContent = 'Просмотр счета';

  // функция перехода на страницу подробного просмотра истории баланса
  // по клику на график истории баланса и таблицу истории переводов
  function addEventClickOpenHistory(element) {
    // обработчик события клика по элементу
    element.addEventListener('click', async (event) => {
      event.preventDefault();
      // получаем токен из SessionStorage
      const token = sessionStorage.getItem('token');
      // с сервера получаем подробную информацию о счёте пользователя
      // отображаем спиннер
      appSpinner.show();
      // убираем инф окно
      appMessage.hide();

      // по умолчанию в случае ошибки сервера
      let accountUpdate = {
        error: '',
        payload: {
          account: '0000000000000000',
          balance: 0,
          mine: true,
          transactions: [],
        },
      };
      try {
        accountUpdate = await getAccount(token, account.payload.account);
        // убираем спиннер
        appSpinner.hide();
      } catch {
        // убираем спиннер
        appSpinner.hide();
        // показываем инф окно
        appMessage.show();
        // отобрааем текст сообщения
        appMessage.text.textContent = 'Ошибка свяи с сервером.';
      }
      // меняем ULR-страницы
      history.pushState(
        null,
        '',
        `/account-history?id=${account.payload.account}`,
      );
      if (document.getElementById('accountContent')) {
        // вызываем функцию отрисовки страницы подробного просмотра истории баланса
        renderAccountHistory(
          document.getElementById('accountContent'),
          accountUpdate,
          title,
        );
      }
    });
  }

  // создаем элемент - обертка для grid-сетки
  const accountViewContent = el('div.account-view', { id: 'accountView' });

  // создаем элемент - grid-сетку
  const accountViewGrid = el('div.account-view__grid');

  // создаем элемент grid-сетки - оберка элемента формы перевода
  const accountViewGridTransfer = el('div.account-view__grid-item', {
    id: 'accountTransfer',
  });

  // создаем элемент grid-сетки - оберка элемента графика истории баланса
  const accountViewGridChart = el('div.account-view__grid-item.chart__card', {
    id: 'accountChart',
  });
  // выываем функцию перехода на страницу подробного просмотра истории баланса
  // по клику на график истории баланса
  addEventClickOpenHistory(accountViewGridChart);

  // создаем элемент grid-сетки - оберка элемента таблицы истории переводов
  const accountViewGridHistory = el('div.account-view__grid-item', {
    id: 'accountHistoryTransfer',
  });
  // выываем функцию перехода на страницу подробного просмотра истории баланса
  // по клику на таблицу истории переводов
  addEventClickOpenHistory(accountViewGridHistory);

  // помещаем grid-элементы в grid-сетку
  setChildren(
    accountViewGrid,
    accountViewGridTransfer,
    accountViewGridChart,
    accountViewGridHistory,
  );

  // помещаем в обертку grid-сетку
  setChildren(accountViewContent, accountViewGrid);

  // вызываем функцию отрисовки формы перевода
  renderAccountTransfer(accountViewGridTransfer, account, balance);
  // вызываем функцию отрисовки графика истории баланса
  renderAccountChart(accountViewGridChart, account, 6, false, 576);
  // вызываем функцию отрисовки таблицы истории переводов
  renderAccountHistoryTransfer(accountViewGridHistory, account);

  // помещаем все соданные элемент в корневой элемент
  setChildren(rootElement, accountViewContent);

  // возвращаем созданный элемент
  return accountViewContent;
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки страницы подробного просмотра истории баланса
function renderAccountHistory(rootElement, account, title) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';
  // меняем заголовок страницы
  title.textContent = 'История баланса';

  // создаем элемент - обертка для grid-сетки
  const accountHistoryContent = el('div.account-history', {
    id: 'accountHistory',
  });

  // создаем элемент - grid-сетку
  const accountHistoryGrid = el('div.account-history__grid');

  // создаем элемент grid-сетки - оберка элемента графика динамики баланса
  const accountHistoryGridBalance = el('div.account-history__grid-item');

  // создаем элемент grid-сетки - оберка элемента графика соотношения входящих и исходящих транзакций
  const accountHistoryGridTransaction = el('div.account-history__grid-item');

  // создаем элемент grid-сетки - оберка элемента таблицы полной истории переводов
  const accountHistoryGridHistory = el('div.account-history__grid-item');

  // помещаем grid-элементы в grid-сетку
  setChildren(
    accountHistoryGrid,
    accountHistoryGridBalance,
    accountHistoryGridTransaction,
    accountHistoryGridHistory,
  );

  // помещаем в обертку grid-сетку
  setChildren(accountHistoryContent, accountHistoryGrid);

  // вызываем функцию отрисовки графика динамики баланса
  renderAccountChart(accountHistoryGridBalance, account, 12);
  // вызываем функцию отрисовки графика соотношения входящих и исходящих транзакций
  renderAccountChart(accountHistoryGridTransaction, account, 12, true);
  // вызываем функцию отрисовки таблицы полной истории переводов
  renderAccountHistoryTransfer(accountHistoryGridHistory, account, true);

  // помещаем все соданные элемент в корневой элемент
  setChildren(rootElement, accountHistoryContent);

  // возвращаем созданный элемент
  return accountHistoryContent;
}

// главная функция отрисовки страницы информации о существующей карте
export async function render(data) {
  // console.log(`\u20BD`);
  // создаем секцию страницы
  const accountSection = el('section.account');
  // создаем контейнер секции
  const accountContainer = el('div.account__container.container');
  // помещаем контейнер в секцию
  setChildren(accountSection, accountContainer);

  // и localStorage получаем токен
  const token = sessionStorage.getItem('token');

  // отображаем спиннер
  appSpinner.show();
  // убираем инф сообщение
  appMessage.hide();

  // по умолчанию в случае ошибки сервера
  let account = {
    error: '',
    payload: {
      account: '0000000000000000',
      balance: 0,
      mine: true,
      transactions: [],
    },
  };
  try {
    // с сервера получаем данные карты
    account = await getAccount(token, data.id);
    // убираем спиннер
    appSpinner.hide();
  } catch (err) {
    // убираем спиннер
    appSpinner.hide();

    if (err.name === 'ErrorGetAccount') {
      // изменяем URL браузера
      history.pushState(null, '', '/login');
      // удаляем токен из SessionStorage
      sessionStorage.removeItem('token');
      // вызываем функцию отрисовки страницы авторизации пользователя
      renderElement(`header`, document.querySelector('#appHeader'), false);
      renderElement('auth', document.querySelector('#appContainer'));
    } else {
      // показываем инф окно
      appMessage.show();
      // отобрааем текст сообщения
      appMessage.text.textContent = 'Ошибка свяи с сервером.';
    }
  }

  // содаем html-елемент - шапка страницы с информацией по карте
  const accountHeader = createAccountHeader(account);
  // передаем в переменную html-елемент заголовка шапки страницы с информацией по карте
  const accountHeaderTitle = accountHeader.title;
  // передаем в переменную html-елемент поля баланса шапки страницы с информацией по карте
  const accountHeaderBalance = accountHeader.balance;

  // содаем html-елемент - основой контент
  const accountContent = el('div.account__content', { id: 'accountContent' });

  // определяем какую страницу будем выводить
  // страница с инф о существующей карте и форму перевода средств
  if (data.page == 'view') {
    renderAccountView(
      accountContent,
      account,
      accountHeaderTitle,
      accountHeaderBalance,
    );
    // страница подробного просмотра истории баланса
  } else if (data.page == 'history') {
    renderAccountHistory(accountContent, account, accountHeaderTitle);
  }

  // помещаем все элементы в контейнер секции
  setChildren(accountContainer, accountHeader.element, accountContent);

  // выводим итоговый html-element
  return accountSection;
}
