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

/** 배달 모드용 메뉴 64개 */
export const DELIVERY_MENUS: Restaurant[] = [
  // 치킨
  menu('chicken',       '치킨',          '치킨'),
  menu('chicken-gang',  '강정치킨',       '치킨'),
  menu('chicken-roast', '구운치킨',       '치킨'),

  // 피자
  menu('pizza',         '피자',          '피자'),

  // 중식
  menu('jjajjam',       '짜장면/짬뽕/탕수육', '중식'),
  menu('mara',          '마라탕',         '중식'),
  menu('yankkochi',     '양꼬치',         '중식'),
  menu('mapo',          '마파두부',        '중식'),
  menu('jjamppong-bap', '짬뽕밥',         '중식'),
  menu('gganpung',      '깐풍기',         '중식'),
  menu('yukgaejang-cn', '볶음밥',         '중식'),

  // 일식
  menu('sushi',         '초밥',          '일식'),
  menu('donkatsu',      '돈까스',         '일식'),
  menu('curry',         '카레',          '일식'),
  menu('ramen',         '라멘',          '일식'),
  menu('udon',          '우동',          '일식'),
  menu('takoyaki',      '타코야키',       '일식'),
  menu('katsu-sando',   '카츠산도',       '일식'),

  // 버거
  menu('burger',        '햄버거',         '버거'),

  // 분식
  menu('tteok',         '떡볶이',         '분식'),
  menu('gimbap',        '김밥',          '분식'),
  menu('sundae',        '순대',          '분식'),
  menu('toast',         '토스트',         '분식'),
  menu('hotdog',        '핫도그',         '분식'),
  menu('twigim',        '튀김',          '분식'),
  menu('ramyun',        '라면',          '분식'),

  // 한식
  menu('bossam',        '보쌈/족발',      '한식'),
  menu('bibim',         '비빔밥',         '한식'),
  menu('gukbap',        '국밥',          '한식'),
  menu('jjigae',        '찌개/전골',      '한식'),
  menu('yangnyeom-gej', '양념게장',       '한식'),
  menu('dakgalbi',      '닭갈비',         '한식'),
  menu('bulgogi',       '불고기',         '한식'),
  menu('jeyuk',         '제육볶음',       '한식'),
  menu('kimchi-jjim',   '김치찜',         '한식'),
  menu('dwaeji-gukbap', '돼지국밥',       '한식'),
  menu('konnamul-bap',  '콩나물국밥',      '한식'),
  menu('jeon',          '전/파전',        '한식'),
  menu('dosirak',       '도시락',         '한식'),
  menu('chueo',         '추어탕',         '한식'),

  // 구이
  menu('gopchang',      '곱창/막창',      '구이'),
  menu('samgyup',       '삼겹살',         '구이'),
  menu('galbi',         '갈비',          '구이'),
  menu('deungsim',      '소고기',         '구이'),

  // 양식
  menu('pasta',         '파스타',         '양식'),
  menu('steak',         '스테이크',       '양식'),
  menu('sandwich',      '샌드위치',       '양식'),
  menu('risotto',       '리조또',         '양식'),
  menu('gratin',        '그라탕',         '양식'),

  // 샐러드
  menu('poke',          '포케/샐러드',     '샐러드'),
  menu('acai',          '아사이볼',       '샐러드'),

  // 아시안
  menu('thai',          '팟타이/쌀국수',   '아시안'),
  menu('banhmi',        '반미',          '아시안'),
  menu('nasi',          '나시고렝',       '아시안'),
  menu('tomyum',        '똠양꿍',         '아시안'),
  menu('yakisoba',      '볶음면',         '아시안'),

  // 멕시칸
  menu('taco',          '타코/부리또',     '멕시칸'),
  menu('nachos',        '나초',          '멕시칸'),
  menu('quesadilla',    '퀘사디아',       '멕시칸'),

  // 해산물
  menu('nakji',         '낙지/쭈꾸미',     '해산물'),
  menu('jogae',         '조개구이',       '해산물'),
  menu('saeu',          '새우요리',       '해산물'),

  // 안주/야식
  menu('dakbal',        '닭발',          '안주'),
  menu('bungeo',        '붕어빵/호떡',     '간식'),
  menu('waffle',        '와플/크레페',     '디저트'),
  menu('ttangkong',     '떡/약과',        '디저트'),
];
