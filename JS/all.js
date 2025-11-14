console.log(api_path, token);

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
let productData = [];

// 設定初始化
function init() {
  getProductList();
}
init();

function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      productData = response.data.products;
      let str = "";
      productData.forEach(function (item) {
        str += `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src=${item.images}
            alt="${item.title}"
          />
          <a href="#" class="addCardBtn">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${item.origin_price}</del>
          <p class="nowPrice">NT$${item.price}</p>
        </li>`;
      });
      productList.innerHTML = str;
    });
}

// 設定選取區
