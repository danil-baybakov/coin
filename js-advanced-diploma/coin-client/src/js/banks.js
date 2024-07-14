import { el, setChildren } from 'redom';
import { getBanks } from './server';
import * as ymaps3 from 'ymaps3';
import imgMapMarker from '../assets/image/common/map-marker.svg';
import { appSpinner } from './spinner.js';
import { appMessage } from './message.js';

// функция инициалиации Яндекс-карт
export async function initMap(elMap, settings, markerProps) {
  await ymaps3.ready;
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
    ymaps3;
  const map = new YMap(elMap, settings, [
    new YMapDefaultSchemeLayer({}),
    new YMapDefaultFeaturesLayer({}),
  ]);
  markerProps.forEach((markerProp) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'marker';
    const markerImg = document.createElement('img');
    markerImg.className = 'marker__icon';
    markerImg.src = markerProp.iconSrc;
    markerElement.append(markerImg);
    map.addChild(
      new YMapMarker({ coordinates: markerProp.coordinates }, markerElement),
    );
  });
  return map;
}

// главная функция отрисовки страницы карты банкоматов
export async function render() {
  // создаем корневой елемент
  const root = el('section.banks');
  // создаем контейнер для элементов
  const container = el('div.banks__container.container');
  // создаем заголовок страницы
  const title = el(
    'h2.banks__title.gap-reset.title.title-ptb',
    'Карта банкоматов',
  );

  // отображаем спиннер
  appSpinner.show();
  // убираем инф сообщение
  appMessage.hide();

  // создаем элемент - обертка карты банкоматов
  const wrapperMap = el('div.banks__wrapper');

  // создаем элемент - карта банкоматов
  const elMap = el('div.banks__map');

  // помещаем карту в обертку
  setChildren(wrapperMap, elMap);

  // помещаем элементы в контейнер
  setChildren(container, title, wrapperMap);

  // помещаем контейнер в корневой элемент
  setChildren(root, container);
  try {
    // делаем запрос на сервер для получения списка точек, отмечающих места банкоматов
    const response = await getBanks();

    // список точек, отмечающих места банкоматов помещаем в переменную
    const points = response.payload;

    // координаты центра
    let coordinatesCenter = [37.588144, 55.733842];

    const markerProps = [];

    // формируем отметки расположения банкоматов на карте
    if (points.length > 0) {
      let minLat = points[0].lat;
      let maxLat = points[0].lat;
      let minLon = points[0].lon;
      let maxLon = points[0].lon;
      points.forEach((item) => {
        if (item.lat < minLat) minLat = item.lat;
        if (item.lat > maxLat) maxLat = item.lat;
        if (item.lon < minLon) minLon = item.lon;
        if (item.lon > maxLon) maxLon = item.lon;
        markerProps.push({
          coordinates: [item.lon, item.lat],
          iconSrc: imgMapMarker,
        });
      });
      // выставляем координаты центра карты
      coordinatesCenter = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
    }

    // Яндекс-карты - создаем объект с настройками
    const settings = {
      location: {
        center: coordinatesCenter,
        zoom: 4.5,
      },
    };

    // Яндекс-карты - вызов функции инициалиации
    await initMap(elMap, settings, markerProps);
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

  // вовращаем созданный элемент
  return root;
}
