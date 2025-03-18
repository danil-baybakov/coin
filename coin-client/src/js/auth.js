import { el, setChildren } from 'redom';
import { authorization } from './server.js';
import { renderElement } from './auxiliary.js';
import { appSpinner } from './spinner.js';
import { appMessage } from './message.js';

//////////////////////////////////////////////////////////////////////////////////////////
// функция отрисовки формы аутентификации пользователя
export function render() {
  // убираем спиннер
  appSpinner.hide();

  // убираем инф окно
  appMessage.hide();

  // создание корневой элемент
  const element = el('section.auth');

  // создаем контейнер
  const container = el('div.auth__container.container.container-nc.pt-0');
  // добавляем контейнер в корневой элемент
  setChildren(element, container);

  // создаем обертку формы
  const formWrapper = el('div.auth__form-wrapper');
  // помещаем обертку в контейнер
  setChildren(container, formWrapper);

  // содаем форму данных
  const form = el('form.auth__form');
  // помещаем форму в обертку
  setChildren(formWrapper, form);

  // создание заголовка формы
  const groupTitle = el('div.auth__form-group.form__group');
  const title = el('h1.auth__form-title.title.gap-reset', 'Вход в аккаунт');
  setChildren(groupTitle, title);

  // создание поля ввода логина
  const groupLogin = el('div.auth__form-group.form__group');
  const lableLogin = el('lable.auth__form-lable.form__label', 'Логин');
  const wrapInputLogin = el('div.auth__form-input-wrapper.input-wrapper');
  const inputLogin = el('input.auth__form-input.input', {
    type: 'text',
  });
  inputLogin.dataset.name = 'login';
  const messageLogin = el('span.auth__form-message.input__message', 'Ошибка');
  messageLogin.dataset.name = 'loginMessage';
  setChildren(wrapInputLogin, inputLogin, messageLogin);
  setChildren(groupLogin, lableLogin, wrapInputLogin);

  // создание поля ввода пароля
  const groupPassword = el('div.auth__form-group.form__group');
  const lablePassword = el('lable.auth__form-lable.form__label', 'Пароль');
  const wrapInputPassword = el('div.auth__form-input-wrapper.input-wrapper');
  const inputPassword = el('input.auth__form-input.input', {
    type: 'password',
  });
  inputPassword.dataset.name = 'password';
  const messagePassword = el(
    'span.auth__form-message.input__message',
    'Ошибка',
  );
  messagePassword.dataset.name = 'passwordMessage';
  setChildren(wrapInputPassword, inputPassword, messagePassword);
  setChildren(groupPassword, lablePassword, wrapInputPassword);

  // создание кнопки отправки данных
  const groupBtn = el('div.auth__form-group.form__group');
  const btn = el(
    'button.auth__form-btn.btn.link-reset.btn-fill',
    { type: 'submit' },
    'Войти',
  );
  btn.dataset.name = 'submit';
  const messageBtn = el('span.auth__form-message.btn__message', {
    id: 'errorAuth',
  });
  messageBtn.dataset.name = 'submitMessage';
  setChildren(groupBtn, btn, messageBtn);

  // обработка события нажатия кнопки авторизации пользователя
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
      ['login', 'password', 'submit'].map((name) => {
        inputs[name].classList.remove('is-message', 'is-invalid', 'is-success');
        inputs[name].value = '';
        messeges[`${name}Message`].classList.remove(
          'message-error',
          'message-success',
        );
        messeges[`${name}Message`].textContent = '';
      });
    });

    try {
      // запрос аутентификации польователя на сервер
      const authResult = await authorization(data);
      // убираем спиннер
      appSpinner.hide();
      // убираем инф сообщение
      appMessage.hide();
      // сораняем токен в sessionStorage
      sessionStorage.setItem('token', authResult.payload.token);
      // меняем URL
      history.pushState(null, '', '/accounts');
      // отрисовываем страницу списка счетов пользователя
      renderElement(`header`, document.querySelector('#appHeader'), true);
      renderElement('user', document.querySelector('#appContainer'));
    } catch (err) {
      // убираем спиннер
      appSpinner.hide();
      //  вывод ошибок вылидации формы
      if (err.name === 'InvalidAuth') {
        for (const error of err.errors) {
          inputs[error.name].classList.add('is-message', 'is-invalid');
          messeges[`${error.name}Message`].classList.add('message-error');
          messeges[`${error.name}Message`].textContent = error.message;
        }
        //  вывод ошибок аутентификации
      } else {
        inputs['submit'].classList.add('is-message', 'is-invalid');
        messeges['submitMessage'].classList.add('message-error');
        if (err.name === 'ErrorAuth') {
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

  // добавление эл-ов формы в контейнер
  setChildren(form, groupTitle, groupLogin, groupPassword, groupBtn);

  // вывод итогового html-элемента
  return element;
}
