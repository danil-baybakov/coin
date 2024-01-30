import { el, setChildren } from 'redom';
import { authorization } from './server.js';

// функция отрисовки формы аутентификации пользователя
export function render() {
  // создание контейнера
  const auth = el('section.auth');
  const authContainer = el('div.auth__container.container.container2');
  setChildren(auth, authContainer);
  const authFormWrapper = el('div.auth__form-wrapper');
  setChildren(authContainer, authFormWrapper);
  const authForm = el('form.auth__form');
  setChildren(authFormWrapper, authForm);

  // создание заголовка
  const header = el('h1.auth__form-title.title-h1.gap-reset', 'Вход в аккаунт');

  // создание поля ввода логина
  const loginGroupe = el('div.auth__form-group');
  const loginLable = el('lable.auth__form-lable', { for: 'login' }, 'Логин');
  const loginGroupInput = el('div.auth__form-group-input');
  const login = el('input.auth__form-input.input-reset', {
    type: 'text',
    id: 'login',
    name: 'login',
  });
  const loginMessage = el(
    'span.auth__form-error',
    { id: 'loginError' },
    'Ошибка',
  );
  setChildren(loginGroupInput, login, loginMessage);
  setChildren(loginGroupe, loginLable, loginGroupInput);

  // создание поля ввода пароля
  const passwordGroup = el('div.auth__form-group');
  const passwordLable = el(
    'lable.auth__form-lable',
    { for: 'password' },
    'Пароль',
  );
  const loginGroupPassword = el('div.auth__form-group-input');
  const password = el('input.auth__form-input.input-reset', {
    type: 'text',
    id: 'password',
    name: 'password',
  });
  const passwordMessage = el(
    'span.auth__form-error',
    { id: 'passwordError' },
    'Ошибка',
  );
  setChildren(loginGroupPassword, password, passwordMessage);
  setChildren(passwordGroup, passwordLable, loginGroupPassword);

  // создание кнопки отправки данных
  const authBtnGroup = el('div.auth__form-group');
  const authBtn = el(
    'button.auth__form-btn.is-error',
    { type: 'submit' },
    'Войти',
  );
  const authMessage = el('span.auth__form-error.auth__form-error-v2', {
    id: 'errorAuth',
  });
  setChildren(authBtnGroup, authBtn, authMessage);

  // обработка события нажатия кнопки авторизации пользователя
  authBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const data = {};
    const inputs = {};
    const elementsMessageErrors = {};
    for (let i = 0; i < authForm.elements.length; ++i) {
      const input = authForm[i];
      if (!input.name) continue;
      input.value = input.value.trim();
      data[input.name] = input.value;
      inputs[input.name] = input;
      elementsMessageErrors[input.name] = document.querySelector(
        `#${input.name}Error`,
      );
      input.classList.remove('is-invalid');
      document.querySelector('#errorAuth').textContent = '';
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    }

    try {
      const result = await authorization(data);
      localStorage.setItem('token', result.payload.token);
      history.pushState(null, '', '/accounts');
      import(`./user.js`).then((pageModule) => {
        import(`./header.js`).then((pageModule) => {
          const header = document.querySelector('#appHeader');
          header.classList.add('is-visible');
          header.innerHTML = '';
          header.append(pageModule.render());
        });
        const container = document.querySelector('#appContainer');
        container.innerHTML = '';
        container.append(pageModule.render());
      });
    } catch (err) {
      if (err.name === 'InvalidAuth' && err.errorMessages) {
        for (const errMessage of err.errorMessages) {
          inputs[errMessage.name].classList.add('is-invalid');
          elementsMessageErrors[errMessage.name].textContent =
            errMessage.message;
        }
      } else if (err.name === 'ErrorAuth') {
        authBtn.classList.add('is-error');
        document.querySelector('#errorAuth').textContent =
          err.errorMessages.message;
      }
    }
  });

  // добавление эл-ов формы в контейнер
  setChildren(authForm, header, loginGroupe, passwordGroup, authBtnGroup);

  // вывод итогового html-элемента
  return auth;
}
