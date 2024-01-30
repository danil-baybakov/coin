import { el, setChildren } from 'redom';
// import { authorization } from './server';
// import { renderPage } from './auxiliary';

// функция отрисовки формы аутентификации пользователя
export function render() {
  const user = el('section.user');
  const userContainer = el('div.user__container.container');
  setChildren(user, userContainer);
  return user;
}
