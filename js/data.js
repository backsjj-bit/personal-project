(function () {
  const categories = [
    { id: "coffee", name: "Coffee", label: "커피", description: "에스프레소 기반의 기본 메뉴" },
    { id: "latte", name: "Latte", label: "라떼", description: "우유와 크림이 어우러진 부드러운 메뉴" },
    { id: "tea", name: "Tea", label: "티", description: "가볍게 즐기는 차와 허브 음료" },
    { id: "dessert", name: "Dessert", label: "디저트", description: "음료와 함께 즐기는 베이커리" },
  ];

  const menus = [
    {
      id: "americano",
      categoryId: "coffee",
      name: "아메리카노",
      englishName: "Americano",
      price: 4500,
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
      description: "깊고 깔끔한 산미가 살아 있는 기본 커피입니다.",
      tags: ["best", "hot", "iced"],
      options: {
        temperature: ["hot", "iced"],
        sizes: ["regular", "large"],
      },
      isSoldOut: false,
      isRecommended: true,
    },
    {
      id: "cafe-latte",
      categoryId: "latte",
      name: "카페라떼",
      englishName: "Cafe Latte",
      price: 5200,
      image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80",
      description: "고소한 우유와 에스프레소가 균형 있게 어우러집니다.",
      tags: ["signature", "hot", "iced"],
      options: {
        temperature: ["hot", "iced"],
        sizes: ["regular", "large"],
      },
      isSoldOut: false,
      isRecommended: true,
    },
    {
      id: "vanilla-latte",
      categoryId: "latte",
      name: "바닐라 라떼",
      englishName: "Vanilla Latte",
      price: 5800,
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
      description: "은은한 바닐라 향을 더한 달콤한 라떼입니다.",
      tags: ["sweet", "iced"],
      options: {
        temperature: ["hot", "iced"],
        sizes: ["regular", "large"],
      },
      isSoldOut: false,
      isRecommended: false,
    },
    {
      id: "earl-grey",
      categoryId: "tea",
      name: "얼그레이 티",
      englishName: "Earl Grey Tea",
      price: 4800,
      image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=80",
      description: "베르가못 향이 산뜻하게 퍼지는 클래식 티입니다.",
      tags: ["hot", "light"],
      options: {
        temperature: ["hot"],
        sizes: ["regular"],
      },
      isSoldOut: false,
      isRecommended: false,
    },
    {
      id: "green-tea-latte",
      categoryId: "latte",
      name: "말차 라떼",
      englishName: "Green Tea Latte",
      price: 5900,
      image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80",
      description: "진한 말차와 우유의 부드러운 맛을 살렸습니다.",
      tags: ["signature", "sweet"],
      options: {
        temperature: ["hot", "iced"],
        sizes: ["regular", "large"],
      },
      isSoldOut: false,
      isRecommended: true,
    },
    {
      id: "butter-croissant",
      categoryId: "dessert",
      name: "버터 크루아상",
      englishName: "Butter Croissant",
      price: 4200,
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
      description: "겹겹이 바삭한 결이 살아 있는 기본 베이커리입니다.",
      tags: ["bakery", "morning"],
      options: {
        temperature: ["room"],
        sizes: ["single"],
      },
      isSoldOut: false,
      isRecommended: false,
    },
  ];

  const orders = [];

  window.CafeData = Object.freeze({
    categories,
    menus,
    orders,
  });
})();
