import type { Restaurant } from '@/hooks/useNearbyRestaurants';

function menu(id: string, name: string, cat: string): Restaurant {
  return {
    id: `del-${id}`,
    place_name: name,
    category_name: `배달 > ${cat}`,
    distance: '0',
    address_name: '배달 주문',
    place_url: '',
    x: '0',
    y: '0',
  };
}

/** 배달 모드용 메뉴 32개 */
export const DELIVERY_MENUS: Restaurant[] = [
  menu('chicken',    '치킨',      '치킨'),
  menu('pizza',      '피자',      '피자'),
  menu('jjajang',    '짜장면',     '중식'),
  menu('jjambbong',  '짬뽕',      '중식'),
  menu('tangsuyuk',  '탕수육',     '중식'),
  menu('mara',       '마라탕',     '중식'),
  menu('sushi',      '초밥',      '일식'),
  menu('donkatsu',   '돈까스',     '일식'),
  menu('curry',      '카레',      '일식'),
  menu('ramen',      '라멘',      '일식'),
  menu('burger',     '햄버거',     '버거'),
  menu('tteok',      '떡볶이',     '분식'),
  menu('gimbap',     '김밥',      '분식'),
  menu('sundae',     '순대',      '분식'),
  menu('bossam',     '보쌈/족발',   '한식'),
  menu('bibim',      '비빔밥',     '한식'),
  menu('gukbap',     '국밥',      '한식'),
  menu('jjigae',     '찌개/전골',   '한식'),
  menu('gopchang',   '곱창/막창',   '구이'),
  menu('samgyup',    '삼겹살',     '구이'),
  menu('pasta',      '파스타',     '양식'),
  menu('steak',      '스테이크',    '양식'),
  menu('sandwich',   '샌드위치',    '양식'),
  menu('poke',       '포케/샐러드',  '샐러드'),
  menu('thai',       '팟타이/쌀국수', '아시안'),
  menu('taco',       '타코/부리또',  '멕시칸'),
  menu('nakji',      '낙지/쭈꾸미',  '해산물'),
  menu('jokbal',     '양념게장',    '한식'),
  menu('toast',      '토스트',     '분식'),
  menu('dakbal',     '닭발',      '안주'),
  menu('yankkochi',  '양꼬치',     '중식'),
  menu('hotdog',     '핫도그',     '분식'),
];
