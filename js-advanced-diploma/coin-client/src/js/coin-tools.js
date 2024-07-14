/* eslint-disable no-unused-vars */
import { el, setChildren, mount } from 'redom';
import {
  getListCurrencies,
  wsConnCurrencyFeed,
  allCurrencies,
  currencyBuy,
} from './server';
import Inputmask from 'inputmask';
import SimpleBar from '../resource/simplebar/js/simplebar.min.js';
import { appSpinner } from './spinner.js';
import { appMessage } from './message.js';

// функция отрисовки таблицы списка валют
async function renderCoinList(rootElement) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';

  // создаем элемент - обертка
  const element = el('div.coin-list.card-curriences');

  // создаем заголовок
  const title = el(
    'h2.coin-list__title.card-curriences__title.title-card.gap-reset',
    'Ваши валюты',
  );

  // создаем елемент - обертка для списка валют
  const wrapperList = el('div.coin-list__list-wrapper.currencies-list-wrapper');

  // создаем елемент - списк валют
  const list = el('ul.coin-list__list.currencies__list');
  // помещаем список валют в обертку
  setChildren(wrapperList, list);

  // получаем токен из SessionStorage
  const token = sessionStorage.getItem('token');

  // отображаем спиннер
  appSpinner.show();
  // убираем инф сообщение
  appMessage.hide();

  // запрос на сервер списка валютных счетов текущего пользователя
  let response = null;
  try {
    response = await getListCurrencies(token);
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
  // переменная для хранения списка валютных счетов текущего пользователя
  let listCurrencies = null;
  if (response && !response.error) {
    // записываем в переменную объект со списком валютных счетов текущего пользователя
    listCurrencies = response.payload;
    // создаем формат выводимых значений
    let formatter = new Intl.NumberFormat('ru', { maximumFractionDigits: 10 });
    // проодимся циклом по объекту со списком валютных счетов текущего пользователя
    for (const key in listCurrencies) {
      // создаем элемент списка
      const listItem = el('li.coin-list__list-item.currencies__list-item', [
        el('p.coin-list__list-item-name.currencies__list-item-name', [
          // код валюты
          el(
            'span.coin-list__list-item-name-text.currencies__list-item-name-text',
            `${listCurrencies[key].code}`,
          ),
        ]),
        // сумма
        el(
          'p.coin-list__list-item-amount.currencies__list-item-amount',
          `${formatter.format(listCurrencies[key].amount)}`,
        ),
      ]);
      // если валютный счет не нулевой добавляем и выводим в списке
      if (listCurrencies[key].amount > 0) mount(list, listItem);
    }
  }

  // помещаем в обертку все созданные элементы
  setChildren(element, title, wrapperList);

  // инициалиация кастомного скролла
  new SimpleBar(wrapperList, {
    autoHide: true,
  });

  // помещаем обертку в корневой элемент
  setChildren(rootElement, element);

  // возвращаем созданный элемент
  return element;
}

// функция отрисовки таблицы изменения курсов в реальном времени
function renderCoinRealTime(rootElement) {
  // очищаем корневой элемент
  rootElement.innerHTML = '';

  // создаем элемент - обертка
  const element = el('div.coin-rt.card-curriences');

  // создаем заголовок
  const title = el(
    'h2.coin-rt__title.card-curriences__title.title-card.gap-reset',
    'Изменение курсов в реальном времени',
  );

  // создаем елемент - обертка для списка валют
  const wrapperList = el('div.coin-rt__list-wrapper.currencies-list-wrapper');

  // создаем елемент - списк валют
  const list = el('ul.coin-rt__list.currencies__list');
  // помещаем список валют в обертку
  setChildren(wrapperList, list);
  // создаем формат выводимых значений
  let formatter = new Intl.NumberFormat('ru', { maximumFractionDigits: 10 });
  // создаем подлючение к WebSocket серверу
  const ws = wsConnCurrencyFeed();
  // вешаем обработчик события получения данных через WebSocket
  ws.addEventListener('message', () => {
    // парсим сообщение с сервера
    const data = JSON.parse(event.data);
    // если тип сообщения 'EXCHANGE_RATE_CHANGE'
    if (data.type === 'EXCHANGE_RATE_CHANGE') {
      // формируем имя элемента списка
      const name = `${data.from}/${data.to}`;
      // вспомогательный объект для отображения
      // положительного или отрицательного двиения курса
      // (наименование класса с точкой впереди)
      const classDirectionWithPoint = {
        '-1': '.dw',
        // eslint-disable-next-line prettier/prettier
        '0': '',
        // eslint-disable-next-line prettier/prettier
        '1': '.up',
      };
      // вспомогательный объект для отображения
      // положительного или отрицательного двиения курса
      // (наименование класса без точки впереди)
      const classDirectionWithoutPoint = {
        '-1': 'dw',
        // eslint-disable-next-line prettier/prettier
        '0': '',
        // eslint-disable-next-line prettier/prettier
        '1': 'up',
      };
      // если нет элеиента с таким именем в списке создаем его
      if (!document.getElementById(name)) {
        // создаем элемент списка
        const listItem = el(
          // обертка элемента
          'li.coin-rt__list-item.currencies__list-item',
          [
            // обертка наименования
            el('p.coin-rt__list-item-name.currencies__list-item-name', [
              el(
                // наименование
                `span.coin-rt__list-item-name-text.currencies__list-item-name-text${
                  classDirectionWithPoint[String(data.change)]
                }`,
                `${name}`,
                { id: `name_${name}` },
              ),
            ]),
            // значение
            el(
              `p.coin-rt__list-item-amount.currencies__list-item-rate${
                classDirectionWithPoint[String(data.change)]
              }`,
              `${formatter.format(data.rate)}`,
              { id: `rate_${name}` },
            ),
          ],
          { id: `${name}` },
        );
        // добавляем элемент в начало списока
        mount(list, listItem, list.firstChild);
        // иначе меняем поля в уже сущетвующем
      } else {
        // по id получаем наименование элемента
        const nameElem = document.getElementById(`name_${name}`);
        // по id получаем значение элемента
        const rateElem = document.getElementById(`rate_${name}`);
        // очищаем классы для отображения положительного и отрицательного движения курса
        nameElem.classList.remove('up', 'dw');
        rateElem.classList.remove('up', 'dw');
        // в зависимости от напрвления движения курса
        // добавляем соответствущий класс
        nameElem.classList.add(
          `${classDirectionWithoutPoint[String(data.change)]}`,
        );
        rateElem.classList.add(
          `${classDirectionWithoutPoint[String(data.change)]}`,
        );
        // изменяем значение движения курса
        rateElem.textContent = `${formatter.format(data.rate)}`;
      }
    }
  });

  // помещаем в обертку все созданные элементы
  setChildren(element, title, wrapperList);

  // инициалиация кастомного скролла
  new SimpleBar(wrapperList, {
    autoHide: true,
  });

  // помещаем обертку в корневой элемент
  setChildren(rootElement, element);

  // возвращаем созданный элемент
  return element;
}

// возвраает возвращает массив со списком кодов всех используемых бекэндом валют на данный момент
async function getListAllCurrencies() {
  let list = []; // переменная для хранения списка кодов
  let error = ''; // переменная для хранения сообщения об ошибке
  // отображаем спиннер
  appSpinner.show();
  // убираем инф сообщение
  appMessage.hide();
  try {
    // делаем запрос на сервер
    const response = await allCurrencies();
    // убираем спиннер
    appSpinner.hide();
    // формируем список кодов валют в нужном формате
    response.payload.forEach((item) => {
      list.push({
        value: item,
        label: item,
        selected: false,
      });
    });
    // если список кодов валют не пустой отмечаем первый элемент как выбранный
    if (list && list.length > 0) list[0].selected = true;
  } catch (err) {
    // убираем спиннер
    appSpinner.hide();
    // показываем инф окно
    appMessage.show();
    // отобрааем текст сообщения
    appMessage.text.textContent = 'Ошибка свяи с сервером.';
  }
  // вовращаем объект со списком кодов и сообщение об ошибке если есть
  return { list, error };
}

// функция отрисовки формы обмена валюты
async function renderCoinExchange(rootElement) {
  // получаем токен из SessionStorage
  const token = sessionStorage.getItem('token');

  // очищаем корневой элемент
  rootElement.innerHTML = '';

  // создаем элемент - обертка
  const element = el('div.coin-exchange');

  // создаем заголовок
  const title = el(
    'h2.coin-exchange__title.title-card.gap-reset',
    'Обмен валюты',
  );

  // создаем форму
  const form = el('form.coin-exchange__form');

  // создаем элемент - обертка для верхней левой части формы
  const formLeftTop = el('div.coin-exchange__form-left-top');
  // создаем элемент - обертка для нижней левой части формы
  const formLeftBottom = el('div.coin-exchange__form-left-bottom');
  // создаем элемент - обертка для правой части формы
  const formRight = el('div.coin-exchange__form-right');
  // помещаем обертки левой и правой части формы в форму
  setChildren(form, formLeftTop, formRight, formLeftBottom);

  ////////////////////////////////////////////////////////
  // поле выбора - обиен из какой валюты
  // содаем обертку
  const fromGroup = el('div.coin-exchange__form-group');
  // создаем наименование
  const fromLable = el('lable.coin-exchange__form-lable', 'Из');
  // создаем обертку селекта
  const fromWrapChoice = el(
    'div.coin-exchange__form-choice-wrapper.custom-choice',
  );
  // создаем селект
  const fromChoice = el(
    'select.coin-exchange__form-choice.custom-choice__select.choice',
    {
      id: 'coinExchangeFrom',
    },
  );
  // оборачиваем селект
  setChildren(fromWrapChoice, fromChoice);
  // селекту добавляем дата атрибут - наименование
  fromChoice.dataset.name = 'coinExchangeFrom';
  // помещаем все в обертку
  setChildren(fromGroup, fromLable, fromWrapChoice);
  ////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////
  // поле выбора - обиен в какую валюту
  // содаем обертку
  const toGroup = el('div.coin-exchange__form-group');
  // создаем наименование
  const toLable = el('lable.coin-exchange__form-lable', 'в');
  // создаем обертку селекта
  const toWrapChoice = el(
    'div.coin-exchange__form-choice-wrapper.custom-choice',
  );
  // создаем селект
  const toChoice = el(
    'select.coin-exchange__form-choice.custom-choice.custom-choice__select.choice',
    {
      id: 'coinExchangeTo',
    },
  );
  // оборачиваем селект
  setChildren(toWrapChoice, toChoice);
  // селекту добавляем дата атрибут - наименование
  toChoice.dataset.name = 'coinExchangeTo';
  // помещаем все в обертку
  setChildren(toGroup, toLable, toWrapChoice);
  ////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////
  // поле ввода - суммы обмена
  // содаем обертку
  const amountGroup = el('div.coin-exchange__form-group');
  // создаем наименование
  const amountLable = el(
    'lable.coin-exchange__form-lable.coin-exchange__form-lable-lb',
    'Сумма',
  );
  // создаем инпут
  const amountInput = el('input.coin-exchange__form-input.input', {
    id: 'coinExchangeAmount',
    type: 'text',
  });
  // инпуту добавляем дата атрибут - наименование
  amountInput.dataset.name = 'coinExchangeAmount';
  // устанавливаем маску ввода
  Inputmask('9{1,20}[.9{1,20}]').mask(amountInput);
  // помещаем все в обертку
  setChildren(amountGroup, amountLable, amountInput); // amountInput
  ////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////
  // кнопка обмена валюты
  // содаем обертку
  const btnGroup = el('div.coin-exchange__form-group');
  // создаем кнопку
  const btn = el(
    'a.coin-exchange__form-btn.link-reset.btn.btn-fill',
    'Обменять',
    { id: 'coinExchangeBtn' },
  );
  // кнопке добавляем дата атрибут - наименование
  btn.dataset.name = 'coinExchangeBtn';
  setChildren(btnGroup, btn);
  ////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////
  // поле вывода сообщений об ошибке
  // содаем обертку
  const messageGroup = el('div.coin-exchange__message-group');
  // содаем элемент
  const message = el('div.coin-exchange__message', {
    id: 'coinExchangeMessage',
  });
  // оборачиваем элемент
  setChildren(messageGroup, message);
  ////////////////////////////////////////////////////////

  // функция очищает все информационные сообщения
  function resetMessage(saveValue = false) {
    fromWrapChoice.classList.remove('is-invalid');
    toWrapChoice.classList.remove('is-invalid');
    amountInput.classList.remove('is-invalid');
    message.classList.remove('message-error', 'message-success');
    if (!saveValue) amountInput.value = '';
    message.textContent = '';
  }

  // помещаем соданные элементы в обертку левой верхней части формы
  setChildren(formLeftTop, fromGroup, toGroup);

  // помещаем соданные элементы в обертку левой нижней части формы
  setChildren(formLeftBottom, amountGroup);

  // помещаем соданные элементы в обертку правой части формы
  setChildren(formRight, btnGroup);

  // помещаем в обертку все созданные элементы
  setChildren(element, title, form, messageGroup);

  // помещаем обертку в корневой элемент
  setChildren(rootElement, element);

  // формируем общие настройки для кастомного селекта
  const configChoices = {
    searchEnabled: false,
    position: 'bottom',
    placeholder: false,
    itemSelectText: '',
    sorter: () => {},
  };
  // формируем список для кастомного селекта
  const list = (await getListAllCurrencies()).list;

  // селект - обиен из какой валюты
  // инициалиация
  // eslint-disable-next-line no-undef
  const objChoiseFrom = new Choices(fromChoice, configChoices);
  // формируем список
  objChoiseFrom.setChoices(list, 'value', 'label', true);
  // инициалиация кастомного скролла
  new SimpleBar(objChoiseFrom.dropdown.element, {
    autoHide: true,
  });
  // при открытии селекта очищем все инф сообщения формы
  objChoiseFrom.passedElement.element.addEventListener('showDropdown', () =>
    resetMessage(),
  );

  // селект - обиен в какую валюту
  // инициалиация
  // eslint-disable-next-line no-undef
  const objChoiseTo = new Choices(toChoice, configChoices);
  // формируем список
  objChoiseTo.setChoices(list, 'value', 'label', true);
  // инициалиация кастомного скролла
  new SimpleBar(objChoiseTo.dropdown.element, {
    autoHide: true,
  });
  // при открытии селекта очищаем все инф сообщения формы
  objChoiseTo.passedElement.element.addEventListener('showDropdown', () =>
    resetMessage(),
  );

  // при получении фокуса поля ввода суммы обмена очищаем все инф сообщения формы
  amountInput.addEventListener('focus', () => {
    resetMessage();
  });

  // очищаем форму при клике на любое место кроме формы
  form.addEventListener('click', (event) => {
    event._isClickForm = true;
  });
  window.addEventListener('click', (event) => {
    if (event._isClickForm) return;
    resetMessage();
  });

  // обработчик события клика на кнопку обмена валюты
  btn.addEventListener('click', async (event) => {
    event.preventDefault();
    const values = {};
    const inputs = {};

    // отображаем спиннер
    appSpinner.show();

    // убираем инф окно
    appMessage.hide();

    // убираем все информационные сообщения
    resetMessage(true);

    // получаем список инпутов формы
    for (let i = 0; i < form.elements.length; ++i) {
      const input = form[i];
      if (!input.hasAttribute('data-name')) continue;
      message[input.dataset.nameMessage] = input;
      input.value = input.value.trim();
      values[input.dataset.name] = input.value;
      inputs[input.dataset.name] = input;
    }

    try {
      // получаем токен из SessionStorage
      const token = sessionStorage.getItem('token');
      // формируем объект с данными формы для отправки запроса на сервер
      const data = {
        from: values['coinExchangeFrom'], // код валютного счёта, с которого списываются средства
        to: values['coinExchangeTo'], // код валютного счёта, на который зачисляются средства
        amount: Number(values['coinExchangeAmount']), // сумма, которая списывается, конвертация вычисляется сервером автоматически, исходя из текущего валютного курса для данной валютной пары
      };

      // отправляем запрос на сервер для совершения валютного обмена
      const response = await currencyBuy(
        token,
        data.from,
        data.to,
        data.amount,
      );

      // убираем спиннер
      appSpinner.hide();
      // убираем инф сообщение
      appMessage.hide();

      // вызываем функцию отрисовки таблицы списка валют
      await renderCoinList(document.getElementById('coinList'));

      // выводим инф сообщение о том что обмен совершен
      message.textContent = 'Обмен валюты выполнен!';
      message.classList.add('message-success');
      setTimeout(() => {
        resetMessage();
      }, 1000);

      // console.log(response);
    } catch (error) {
      // убираем спиннер
      appSpinner.hide();
      //  вывод ошибок вылидации формы
      if (error.name === 'ErrorCoinExchange') {
        switch (error.messages.name) {
          case 'invalidCode':
            fromWrapChoice.classList.add('is-invalid');
            toWrapChoice.classList.add('is-invalid');
            break;
          case 'invalidAmount':
          case 'notCurrency':
          case 'overdraftPrevented':
            amountInput.classList.add('is-invalid');
            break;
          default:
            break;
        }
        message.textContent = error.messages.message;
        message.classList.add('message-error');
      } else {
        // показываем инф окно
        appMessage.show();
        // отобрааем текст сообщения
        appMessage.text.textContent = 'Ошибка свяи с сервером.';
      }
    }
  });

  // возвращаем созданный элемент
  return element;
}

// главная функция отрисовки страницы вылютных инструментов
export async function render() {
  // создаем корневой елемент
  const root = el('section.coin-tools');
  // создаем контейнер для элементов
  const container = el('div.coin-tools__container.container');
  // создаем заголовок страницы
  const title = el(
    'h2.coin-tools__title.gap-reset.title.title-ptb',
    'Валютный обмен',
  );

  // создаем елемент - обертка для grid-сетки
  const gridWrapper = el('div.coin-tools__grid-wrapper');
  // создаем елемент - grid-сетка
  const grid = el('div.coin-tools__grid');
  // создаем елемент - grid-елемент - обертка для таблицы списка валют
  const griditem1 = el('div.coin-tools__grid-item', { id: 'coinList' });
  // создаем елемент - grid-елемент - обертка для таблицы изменения курсов в реальном времени
  const griditem2 = el('div.coin-tools__grid-item', { id: 'coinRealTime' });
  // создаем елемент - grid-елемент - обертка для формы обмена валюты
  const griditem3 = el('div.coin-tools__grid-item', { id: 'coinExchange' });
  // помещаем в обертку grid-сетку
  setChildren(gridWrapper, grid);
  // помещаем в grid-сетку елементы
  setChildren(grid, griditem1, griditem2, griditem3);

  // вызываем функцию отрисовки таблицы списка валют
  await renderCoinList(griditem1);
  // вызываем функцию отрисовки таблицы изменения курсов в реальном времени
  renderCoinRealTime(griditem2);
  // вызываем функцию отрисовки формы обмена валюты
  await renderCoinExchange(griditem3);

  // помещаем элементы в контейнер
  setChildren(container, title, gridWrapper);

  // помещаем контейнер в корневой элемент
  setChildren(root, container);

  // вовращаем созданный элемент
  return root;
}
