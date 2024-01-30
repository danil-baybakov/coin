import { el, setChildren } from 'redom';
import { authorization } from './server';
import imgLogo from '../assets/image/header/logo.png';

// функция отрисовки шапки приложения
export function render() {
  // создание контейнера
  const header = el('div.header__container.container.container2');

  // создание логотипа
  const logo = el('div.header__logo');
  const logoPicture = el('picture.header__logo-picture');
  const logoSrcMaxw1920 = el('source.header__logo-source', {
    srcset: imgLogo,
    media: '(max-width: 1920px)',
  });
  const logoSrcMinw1920 = el('source.header__logo-source', {
    srcset: imgLogo,
    media: '(min-width: 1920px)',
  });
  const logoImg = el('img.header__logo-img', { src: imgLogo });
  setChildren(logo, logoPicture);
  setChildren(logoPicture, logoSrcMaxw1920, logoSrcMinw1920, logoImg);

  // создание навигации
  const nav = el('nav.header__nav');
  const navList = el('ul.header__nav-list.list-reset');

  // кнопка Банкоматы
  const navItemBanks = el('li.header__nav-item');
  const bthBanks = el(
    'a.header__nav-btn.link-reset.btn-outline',
    {
      id: 'btnBanks',
      href: '#',
    },
    'Банкоматы',
  );
  setChildren(navItemBanks, bthBanks);

  // кнопка Счета
  const navItemAccounts = el('li.header__nav-item');
  const bthAccounts = el(
    'a.header__nav-btn.link-reset.btn-outline',
    {
      id: 'btnAccounts',
      href: '#',
    },
    'Счета',
  );
  setChildren(navItemAccounts, bthAccounts);

  // кнопка Валюта
  const navItemСurrency = el('li.header__nav-item');
  const bthСurrency = el(
    'a.header__nav-btn.link-reset.btn-outline',
    {
      id: 'btnCurrency',
      href: '#',
    },
    'Валюта',
  );
  setChildren(navItemСurrency, bthСurrency);

  // кнопка Выйти
  const navItemExit = el('li.header__nav-item');
  const bthExit = el(
    'a.header__nav-btn.link-reset.btn-outline',
    {
      id: 'btnExit',
      href: '#',
    },
    'Выйти',
  );
  setChildren(navItemExit, bthExit);

  setChildren(
    navList,
    navItemBanks,
    navItemAccounts,
    navItemСurrency,
    navItemExit,
  );

  setChildren(nav, navList);
  setChildren(header, logo, nav);

  return header;
}
