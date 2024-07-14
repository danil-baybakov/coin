import { el, setChildren, mount } from 'redom';
import { getAccounts, createAccount } from './server';
import { parseTransactionDate, renderElement } from './auxiliary';
import { appSpinner } from './spinner.js';
import { appMessage } from './message.js';

//////////////////////////////////////////////////////////////////////////////////////////
// функция создания панели управления списком счетов польователя
function createAccountsListHeader() {
  // переменная для хранения списка вариантов сортировки
  const arrChoice = [
    'Сортировка',
    'По номеру',
    'По балансу',
    'По последней транзакции',
  ];

  // создаем основной элемент
  const element = el('div.user__header');

  // селект сортировки
  // создаем общую обертку
  const choiceMainWrapper = el('div.user__choice');
  // создаем заголовок
  const choiceTitle = el('h2.user__choice-title.gap-reset.title', 'Ваши счета');
  // содаем обертку для селекта
  const choiceWrapper = el('div.user__choice-wrapper.custom-choice');
  // создаем селект
  const choice = el('select.user__choice-select.custom-choice__select.choice');
  // добавляем в селект список вариантов сортировки
  for (let value of arrChoice) {
    mount(
      choice,
      el(
        'option.user__choice-option.custom-choice__option',
        { value: `${value}` },
        `${value}`,
      ),
    );
  }
  // помещаем в обертку селект
  setChildren(choiceWrapper, choice);
  // все помещаем в общую обертку
  setChildren(choiceMainWrapper, choiceTitle, choiceWrapper);
  // инициалиируем кастомный селект
  // eslint-disable-next-line no-undef
  const choiceObj = new Choices(choice, {
    searchEnabled: false,
    position: 'bottom',
    placeholder: false,
    itemSelectText: '',
    sorter: () => {},
  });

  // кнопка создания нового счета
  // создаем кнопку
  const btn = el('button.user__btn.btn.link-reset.btn-fill.btn-fill-icon', {
    id: 'btnCreateAccount',
    type: 'button',
  });
  // создаем иконку для кнопки
  const btnIcon = el(
    'span.user__btn-icon.btn-fill__icon',
    'Создать новый счет',
  );
  btnIcon.innerHTML = `<svg class="user__btn-svg btn-fill__svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="user__btn-path btn-fill__path" d="M12 4.00001L12 12M12 12L12 20M12 12L20 12M12 12L4 12" stroke="white" stroke-width="2"/>
  </svg>
  `;
  // создаем наименование кнопки
  const btnText = el(
    'span.user__btn-text.btn-fill__text',
    'Создать новый счет',
  );
  // помещаеи иконку и наименование в кнопку
  setChildren(btn, btnIcon, btnText);

  // помещаем в основной элемент все остальное
  setChildren(element, choiceMainWrapper, btn);

  // вовращаем объект с:
  // основным элементом
  // селектом
  // кнопкой создания счета
  return { element, choiceObj, btn };
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция создания карточки счета польователя
function createAccountCard(account) {
  // получаем время последней транзакции
  const timeLastTransaction =
    account.transactions.length > 0
      ? new Date(account.transactions[account.transactions.length - 1].date)
      : null;

  // создаем основной элемент
  const card = el('li.user__item');

  // создаем контейнер основного элемента
  const cardContainer = el('div.user__card');
  // помещаем контейнер в основной элемент
  setChildren(card, cardContainer);

  // создаем элемент заголовка карточки
  const cardTitle = el('p.user__card-title.gap-reset', `${account.account}`);
  // создаем элемент отображения баланса счета
  const cardPrice = el(
    'p.user__card-price.ruble.gap-reset',
    `${Number(account.balance.toFixed(2))}`,
  );

  // создаем нижний блок контента карточки
  const cardBottomContent = el('div.user__card-bottom-content');

  // левая часть нижнего блока контента карточки
  // создаем ее
  const cardBottomContentLeft = el('div.user__card-bottom-content-left');
  // создаем заголовок
  const cardBottomContentLeftTitle = el(
    'h2.user__card-bottom-content-left-title.gap-reset',
    'Последняя транзакция:',
  );
  // создаем элемент с датой последней транакции
  const cardBottomContentLeftTime = el(
    'time.user__card-bottom-content-left-time.gap-reset',
    `${parseTransactionDate(timeLastTransaction)}`,
  );
  // помещаем в нее созданные элементы
  setChildren(
    cardBottomContentLeft,
    cardBottomContentLeftTitle,
    cardBottomContentLeftTime,
  );

  // правая часть нижнего блока контента карточки
  // создаем кнопку открытия окна делальной информации о счете
  const cardBtnAccount = el(
    'a.user__card-btn.link-reset.btn.btn-fill',
    {
      id: `btnAccountOpen-${account.account}`,
      href: `#`,
    },
    'Открыть',
  );
  // вещаем обработчик клика по этой кнопке для
  // открытия окна делальной информации о счете
  cardBtnAccount.addEventListener('click', (event) => {
    event.preventDefault();
    history.pushState(null, '', `/account-view?id=${account.account}`);
    renderElement('account', document.querySelector('#appContainer'), {
      id: account.account,
      page: 'view',
    });
  });
  // помещаем все созданные элементы в нижний блок контента карточки
  setChildren(cardBottomContent, cardBottomContentLeft, cardBtnAccount);

  // помещаем все созданные элементы в контейнер основного элемента
  setChildren(cardContainer, cardTitle, cardPrice, cardBottomContent);

  // выводим итоговый элеиент
  return card;
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки списка карточек счетов пользователя
function renderAccountList(accounts) {
  // создаем переменную для хранения елемента со списком карточек счетов польователя
  let list = null;

  // если елемент существует в DOM
  if (document.querySelector('ul.user__list')) {
    // присваиваем созданной переменной елемент со списком карточек счетов польователя
    list = document.querySelector('ul.user__list');
    // очищаем его
    list.innerHTML = '';
  } else {
    // иначе создаем этот элемент
    list = el('ul.user__list.list-reset');
  }
  // добавляем в элемент карточки
  for (const account of accounts) {
    mount(list, createAccountCard(account));
  }

  // выводим итоговый элемент со списком
  return list;
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция сортировки списка счетов польователя
function sortedAccounts(accounts, choise = 'Сортировка') {
  // помещаем в переменную исходный список счетов пользователя
  const listAccouns = accounts;
  // клонируем в переменную исодный список счетов пользователя
  const sortedListAccounts = [...listAccouns];
  // выбираем вариант сортировки
  switch (choise) {
    // оставляем как есть - не сортируем
    case 'Сортировка':
      return listAccouns;
    // сортируем по номеру счета (по возрастанию)
    case 'По номеру':
      return sortedListAccounts.sort(
        (x, y) => Number(x.account) - Number(y.account),
      );
    // сортируем по значению баланса счета (по возрастанию)
    case 'По балансу':
      return sortedListAccounts.sort(
        (x, y) => Number(x.balance) - Number(y.balance),
      );
    // сортируем по дате последней транзакции (по убыванию)
    case 'По последней транзакции':
      sortedListAccounts.sort((x, y) => {
        const dateX = new Date(
          x.transactions.length > 0
            ? x.transactions[x.transactions.length - 1].date
            : new Date('2000-01-01'),
        );
        const dateY = new Date(
          y.transactions.length > 0
            ? y.transactions[y.transactions.length - 1].date
            : new Date('2000-01-01'),
        );
        return dateY - dateX;
      });
      return sortedListAccounts;
    // по умолчанию возвращаем исходный список
    default:
      return sortedListAccounts;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки страницы со списком счетов пользователя
export async function render() {
  // получаем из sessionStorage токен
  const token = sessionStorage.getItem('token');

  // отображаем спиннер
  appSpinner.show();
  // убираем инф сообщение
  appMessage.hide();

  let accounts = [];
  let responseAccounts = {};

  try {
    // делаем запрос на сервер для получания данных списка счетов пользователя
    responseAccounts = await getAccounts(token);
    // создаем переменную для хранения списка счетов пользователя
    accounts = responseAccounts.payload;
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

  // создаем переменную для хоанения варианта сортировки списка счетов польователя
  let sort = 'Сортировка';

  // создаем корневой елемент страницы
  const user = el('section.user');
  // создаем контейнер
  const userContainer = el('div.user__container.container');
  // помещаем контейнер в корневой элемент страницы
  setChildren(user, userContainer);

  // создаем верхнюю панель страницы с заголовком, селектом сортировки и кнопкой создания нового счета
  const accountsListHeader = createAccountsListHeader();
  // помещаем в переменную селект сортировки
  const choice = accountsListHeader.choiceObj;
  // помещаем в переменную кнопку создания нового счета
  const bthCreateAccount = accountsListHeader.btn;

  // создаем элемент со списоком счетов пользователя
  const accountsList = renderAccountList(sortedAccounts(accounts, sort));

  // вещаем на селект сортировки обработчик события изменения варианта сортировки
  // для сортировки списка
  choice.passedElement.element.addEventListener(
    'change',
    () => {
      // из селекта получаем выбранный вариант сортировки
      sort = choice.getValue(true);
      // перерисовываем список счетов в соответствии с вариантом сортировки
      renderAccountList(sortedAccounts(accounts, sort));
    },
    false,
  );

  // вешаем на кнопку создания нового счета обработчик события клика по ней
  // для создания нового счета
  bthCreateAccount.addEventListener('click', async (event) => {
    // отключаем действия браузера по умолчанию
    event.preventDefault();
    // отображаем спиннер
    appSpinner.show();
    // убираем инф сообщение
    appMessage.hide();
    try {
      // делаем запрос та сервер для содания нового счета
      await createAccount(token);
      // делаем запрос на сервер для получания обновленных данных списка счетов пользователя
      responseAccounts = await getAccounts(token); // обновленный список счетов пользователя помещаем в переменную
      accounts = responseAccounts.payload;
      // перерисовываем список счетов в соответствии обновленному списку
      renderAccountList(sortedAccounts(accounts, sort));
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
  });

  // помещаем в контейнер верхнюю панель страницы и элемент со списоком счетов пользователя
  setChildren(userContainer, accountsListHeader.element, accountsList);

  // возвращаем итоговый элемент
  return user;
}
