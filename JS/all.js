console.log(api_path, token);

const productList = document.querySelector(".productWrap");
let productData = [];
let str = `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="https://hexschool-api.s3.us-west-2.amazonaws.com/custom/dp6gW6u5hkUxxCuNi8RjbfgufygamNzdVHWb15lHZTxqZQs0gdDunQBS7F6M3MdegcQmKfLLoxHGgV3kYunUF37DNn6coPH6NqzZwRfhbsmEblpJQLqXLg4yCqUwP3IE.png"
            alt=""
          />
          <a href="#" class="addCardBtn">加入購物車</a>
          <h3>Antony 雙人床架／雙人加大</h3>
          <del class="originPrice">NT$18,000</del>
          <p class="nowPrice">NT$12,000</p>
        </li>`;
productList.innerHTML = str;

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
        str += `<li>${item.title}</li>`;
      });
      productList.innerHTML = str;
    });
}
