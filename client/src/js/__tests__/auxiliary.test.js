import { getNumberTypeCard, typeCards } from '../auxiliary';
import { test, describe } from '@jest/globals';

describe('Функция getNumberTypeCard', () => {
  test('проверяем что функция вовращает нулевой индекс, если карты с таким наименованем нет', () => {
    expect(getNumberTypeCard(typeCards, 'test')).toBe(0);
  });
  test('проверяем что функция вовращает индекс карты в массиве typeCards, если есть такой', () => {
    expect(getNumberTypeCard(typeCards, 'mastercard')).toBe(1);
  });
});
