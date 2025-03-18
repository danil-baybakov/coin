import { el, setChildren } from 'redom';
import imgClose from '../assets/image/common/close.svg';

// функция создает инф окно
export function createMessage(srcImgClose) {
  // элемент вывода всплывающнго инф окна
  // создаем контейнер окна
  const element = el('div.message__wrapper');
  // создаем элемент с текстом
  const text = el(
    'span.message.message-common.message-error',
    'Ошибка связи с сервером',
  );
  // создаем кнопку закрытия инф окна
  const btn = el(
    'button.message__btn.btn-reset',
    el(
      'span.message__btn-icon-wrapper',
      el('img.message__btn-icon', { src: srcImgClose }),
    ),
  );

  // навешиваем обработчик на кнопку для азкрытия окна
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    element.classList.remove('is-visible');
    text.textContent = '';
  });

  function show() {
    element.classList.add('is-visible');
  }

  function hide() {
    element.classList.remove('is-visible');
    text.textContent = '';
  }
  // помещаем все в контейнер окна
  setChildren(element, text, btn);

  // вовращает
  return {
    element, // основной элемент
    text, // элемент с текстом сообщения
    show, // функция - отображает элемент
    hide, // функция - скрывает элемент
  };
}

// создаем элемент инф сообщения
export const appMessage = createMessage(imgClose);
