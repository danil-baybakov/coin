/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Сoin - приложение', () => {

      beforeEach(() => {
        cy.login('testAppCoin');
        cy.viewport(1440, 1024);
      })

      it( 'Возможность авторизации пользователя' ,() => {
        // заходим на страницу со списком карточек счетов пользователя
        cy.visit('/accounts');
      })

      it( 'Возможность просмотра списка счетов' ,() => {
        // заходим на страницу со списком карточек счетов пользователя
        cy.visit('/accounts');
        cy.get('div.user__container').should('exist');
        cy.get('div.custom-choice').should('exist');
        cy.get('ul.user__list').should('exist');
      })

      it( 'Возможность создать новый счет' ,() => {
        // заходим на страницу со списком карточек счетов пользователя
        cy.visit('/accounts');
        cy.get('ul.user__list').should('exist').find('li').its('length').then((oldLength) => {
          cy.get('button.user__btn').should('exist').click();
          cy.get('ul.user__list').find('li').its('length').should('eq', oldLength + 1);
          cy.get('.user__list').find('li').last().as('lastCard');
          cy.get('@lastCard').should('exist').and('not.be.empty').and('have.class', 'user__item');
          cy.get('@lastCard').find('div.user__card').should('exist').and('not.be.empty').and('have.class', 'user__card').as('card');
          cy.get('@card').find('p.user__card-price').should('exist').contains('0');
          cy.get('@card').find('div.user__card-bottom-content > div.user__card-bottom-content-left > time.user__card-bottom-content-left-time').as('trTime');
          cy.get('@trTime').should('exist').contains('Нет транзакций');
        })
      })

      it('Перенести сумму со счета на счет', () => {
        // заходим на страницу со списком карточек счетов пользователя
        cy.visit('/accounts');

        // создаем карточки если список карточек пустой или в списке меньше 2-х карточек
        cy.get('ul.user__list').then(($elem) => {
          const length = $elem.find('li.user__item').length;
          let count = length;
          while (count < 2) {
            cy.get('button.user__btn').click();
            count++;
          }
        })

        // сортируем список карточек по балансу по возраствнию
        cy.get('div.user__choice-wrapper').click();
        cy.contains('По балансу').click();

        // получаем карточку со счетом - куда будем переводить деньги
        cy.get('ul.user__list > li.user__item').first().as('firstCard');
        cy.get('@firstCard').find('p.user__card-title').as('firstCardNumber');
        cy.get('@firstCard').find('p.user__card-price').as('firstCardBalance');
        cy.get('@firstCard').find('a.user__card-btn').as('firstCardBtn');

        // получаем карточку со счетом - откуда будем переводить деньги
        cy.get('ul.user__list > li.user__item').last().as('lastCard');
        cy.get('@lastCard').find('p.user__card-title').as('lastCardNumber');
        cy.get('@lastCard').find('p.user__card-price').as('lastCardBalance');
        cy.get('@lastCard').find('a.user__card-btn').as('lastCardBtn');


        cy.get('@firstCardNumber').then(($firstCardNumber) => {
          cy.get('@firstCardBalance').then(($firstCardBalance) => {
            cy.get('@lastCardNumber').then(($lastCardNumber) => {
              cy.get('@lastCardBalance').then(($lastCardBalance) => {

                // извлекаем данные этих карточек
                const firstCardNumber = $firstCardNumber.text();
                const firstCardBalance = Number($firstCardBalance.text());
                const lastCardNumber = $lastCardNumber.text();
                const lastCardBalance = Number($lastCardBalance.text());

                cy.log(firstCardNumber);
                cy.log(lastCardNumber);

                //  сумма перевода
                const amountTransfer = 100.5;

                // кликаем на карточку - откуда будем переводить деньги
                // переходим на детальную страницу счета
                cy.get('@lastCardBtn').click();

                // вводим данные для перевода в форму перевода
                cy.get('[data-name="number"]').type(firstCardNumber);
                cy.get('[data-name="amount"]').type(String(amountTransfer));

                // кликаем на кнопку перевода
                cy.get('[data-name="submit"]').click();

                // если недостаточно средств для перевода
                if (lastCardBalance < amountTransfer) {
                  // проверяем что на форме отображается инф сообщение с ошибкой
                  cy.get('[data-name="amountMessage"]').should('have.text', 'Мы попытались перевести больше денег, чем доступно на счёте списания');
                // иначе
                } else {

                  // проверяем что появилась запись о переводе в истории переводов
                  cy.get('.history-transfer__table-tbody-tr').first().as('firstHistoryTransfer');
                  cy.get('@firstHistoryTransfer').find('[id^=tdFrom_]').should('have.text', lastCardNumber);
                  cy.get('@firstHistoryTransfer').find('[id^=tdTo_]').should('have.text', firstCardNumber);
                  cy.get('@firstHistoryTransfer').find('[id^=tdAmount_]').should('have.text', String(-amountTransfer));

                  // по клику на кнопку Счета переходим на страницу счетов
                  cy.contains('Счета').click();

                  // проверяем что в карточках поменялся баланс
                  const shouldFirstCardBalance = firstCardBalance + amountTransfer;
                  const shouldLastCardBalance = lastCardBalance - amountTransfer;
                  cy.contains(firstCardNumber).next().should('have.text', `${Number(shouldFirstCardBalance.toFixed(2))}`);
                  cy.contains(lastCardNumber).next().should('have.text', `${Number(shouldLastCardBalance.toFixed(2))}`);

                }

              })
            })
          })
        })
      })


})
