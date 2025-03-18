// картинки
import imgVisa from '../assets/image/common/card/1-card.svg';
import imgMastercard from '../assets/image/common/card/2-card.svg';
import imgUnionpay from '../assets/image/common/card/3-card.svg';
import imgMaestro from '../assets/image/common/card/4-card.svg';
import imgMir from '../assets/image/common/card/5-card.svg';
// eslint-disable-next-line no-undef
const validCard = require('card-validator');

// массив платежных систем
export const typeCards = [
  { name: 'visa', urlImg: imgVisa },
  { name: 'mastercard', urlImg: imgMastercard },
  { name: 'unionpay', urlImg: imgUnionpay },
  { name: 'maestro', urlImg: imgMaestro },
  { name: 'mir', urlImg: imgMir },
];

// функция выдает индекс платежной системы в массиве typeCards по названию
export function getNumberTypeCard(listTypeCard, text) {
  for (const item in listTypeCard) {
    if (typeCards[item].name === text) {
      return Number(item);
    }
  }
  return 0;
}

// массив меток для гистограммы
export const lableMonth = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
];

// денехный формат
export const formatter = new Intl.NumberFormat('ru', {
  style: 'currency',
  currency: 'RUB',
});

// функция отрисовки страницы
// nameModule - имя модуля
// rootElement - корневой элемент
// data - данные
export function renderElement(nameModule, rootElement, data) {
  import(`./${nameModule}.js`).then(async (module) => {
    const root = rootElement;
    root.innerHTML = '';
    root.append(await module.render(data, root));
  });
}

// функция переключения страниц
export function switchPage(token) {
  const pathName = location.pathname;
  const params = new URLSearchParams(location.search);

  if (pathName === '/' || pathName === '/login' || !token) {
    history.pushState(null, '', '/login');
    renderElement(`header`, document.querySelector('#appHeader'), false);
    renderElement('auth', document.querySelector('#appContainer'));
  } else if (pathName === '/accounts') {
    renderElement(`header`, document.querySelector('#appHeader'), true);
    renderElement('user', document.querySelector('#appContainer'));
  } else if (pathName === '/account-view') {
    renderElement(`header`, document.querySelector('#appHeader'), true);
    renderElement('account', document.querySelector('#appContainer'), {
      id: params.getAll('id')[0],
      page: 'view',
    });
  } else if (pathName === '/account-history') {
    renderElement(`header`, document.querySelector('#appHeader'), true);
    renderElement('account', document.querySelector('#appContainer'), {
      id: params.getAll('id')[0],
      page: 'history',
    });
  } else if (pathName === '/coin-tools') {
    renderElement(`header`, document.querySelector('#appHeader'), true);
    renderElement('coin-tools', document.querySelector('#appContainer'));
  } else if (pathName === '/banks') {
    renderElement(`header`, document.querySelector('#appHeader'), true);
    renderElement('banks', document.querySelector('#appContainer'));
  }
}

// функция парсит дату транзакции
export function parseTransactionDate(date) {
  const arrMonth = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентебря',
    'октября',
    'ноября',
    'декабря',
  ];
  if (date instanceof Date) {
    const dateTime = new Date(date);
    const day = dateTime.getDate();
    const month = arrMonth[dateTime.getMonth()];
    const year = dateTime.getFullYear();
    return `${day} ${month} ${year}`;
  }
  if (!date) return 'Нет транзакций';
  return '';
}

// функция возвращает место вхождения what в строке where
export function getPosInclideStr(what = '', where = '') {
  return where.toLocaleLowerCase().search(what.toLocaleLowerCase());
}

// функция преобраует строку в строку где первый символ в вернем регистре, а остальные в нижнем
export function capitalizeFLetter(text) {
  return text[0].toUpperCase() + text.slice(1);
}

// автокомплит для инпута
export function autoComplite(input, data, rootName, inputName) {
  input.classList.add(
    `${rootName}__form-input`,
    `${rootName}__autocomlite-input`,
    'autocomplite__input',
    'input',
  );
  input.dataset.name = inputName;

  const wrapper = document.createElement('div');
  wrapper.classList.add(
    `${rootName}__form-input-wrapper`,
    `${rootName}__autocomlite-wrapper`,
    'autocomplite__wrapper',
    'input-wrapper',
  );
  input.parentNode.insertBefore(wrapper, input);
  wrapper.append(input);

  const message = document.createElement('span');
  message.classList.add(
    `${rootName}__form-message`,
    `${rootName}__autocomlite-message`,
    'autocomplite__message',
    'input__message',
  );
  message.textContent = '';
  message.dataset.name = `${inputName}Message`;
  wrapper.append(message);

  const imageBlock = document.createElement('div');
  imageBlock.classList.add(
    `${rootName}__form-input-card-img-wrapper`,
    `${rootName}__autocomlite-img-wrapper`,
    'autocomplite__img-wrapper',
  );
  wrapper.append(imageBlock);

  const image = document.createElement('img');
  image.classList.add(
    `${rootName}__form-input-card-img`,
    `${rootName}__autocomlite-img`,
    'autocomplite__img',
  );
  image.src = '';
  imageBlock.append(image);

  const list = document.createElement('div');
  list.classList.add(`${rootName}__autocomplite-list`, 'autocomplite__list');
  wrapper.append(list);

  // функция отображения в инпуте картинки банковкой карты
  function viewImgCard(number) {
    const objValidCard = validCard.number(number);
    // если введен номер банковской карты
    if (objValidCard.isValid) {
      const idTypeCard = getNumberTypeCard(typeCards, objValidCard.card.type);
      imageBlock.classList.add('is-visible');
      image.src = typeCards[idTypeCard].urlImg;
    } else {
      image.src = '';
      imageBlock.classList.remove('is-visible');
    }
  }

  let watches = [];
  let listItems = [];
  let focusedItem = -1;

  function setActive(active = true) {
    if (active) {
      wrapper.classList.add('active');
    } else {
      wrapper.classList.remove('active');
    }
  }

  function focusItem(index) {
    if (!listItems.length) return false;
    if (index > listItems.length - 1) return focusItem(0);
    if (index < 0) return focusItem(listItems.length - 1);
    focusedItem = index;
    unfocusAllItems();
    listItems[focusedItem].classList.add('focused');
  }

  function unfocusAllItems() {
    listItems.forEach((item) => {
      item.classList.remove('focused');
    });
  }

  function selectItem(index) {
    if (!listItems[index]) return false;
    input.value = listItems[index].innerText;
    viewImgCard(input.value);
    setActive(false);
  }

  input.addEventListener('input', (e) => {
    viewImgCard(e.target.value);

    list.innerHTML = '';
    listItems = [];

    let value = input.value;

    data.forEach((dataItem, index) => {
      let search = getPosInclideStr(value, dataItem);
      if (search === -1) return false;
      watches.push(index);

      let parts = [
        dataItem.substr(0, search),
        dataItem.substr(search, value.length),
        dataItem.substr(
          search + value.length,
          dataItem.length - search - value.length,
        ),
      ];

      const item = document.createElement('div');
      item.classList.add(`${name}__autocomplite-item`, 'autocomplite__item');
      item.innerHTML =
        parts[0] + '<strong>' + parts[1] + '</strong>' + parts[2];
      list.append(item);
      listItems.push(item);

      if (listItems.length > 0) {
        setActive(true);
      } else {
        setActive(false);
      }

      item.addEventListener('click', function () {
        selectItem(listItems.indexOf(item));
      });
    });
  });

  input.addEventListener('keydown', (event) => {
    let keyCode = event.keyCode;

    // стрелка вниз
    if (keyCode === 40) {
      event.preventDefault();
      focusedItem++;
      focusItem(focusedItem);
      // стрелка вверх
    } else if (keyCode === 38) {
      event.preventDefault();
      if (focusedItem > 0) focusedItem--;
      focusItem(focusedItem);
      // escape
    } else if (keyCode === 27) {
      setActive(false);
      // enter
    } else if (keyCode === 13) {
      selectItem(focusedItem);
    }
  });

  document.body.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) setActive(false);
  });

  return wrapper;
}
