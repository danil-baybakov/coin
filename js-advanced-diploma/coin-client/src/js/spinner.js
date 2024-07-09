import { el } from 'redom';
import imgSpinner from '../assets/image/common/spinner2.svg';

// функция создает спиннер
function createSpinner(srcImgSpinner) {
  // создаем элемент
  const element = el(
    'div.spinner__wrapper',
    el('div.spinner', el('img.spinner__img', { src: srcImgSpinner })),
  );
  // создаем функцию отображения элемента
  function show() {
    element.classList.add('is-visible');
  }
  // создаем функцию стрытия элемента
  function hide() {
    element.classList.remove('is-visible');
  }
  // возвращает
  return {
    element, // элемент
    show, // функция - отображает элемент
    hide, // функция - скрывает элемент
  };
}

// создаем спиннер
export const appSpinner = createSpinner(imgSpinner);
