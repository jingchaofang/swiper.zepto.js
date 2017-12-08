# swiper.zepto.js
swiper zepto 精简版

## 示例

* slider焦点轮播图，借助breakpoints适配大屏幕设备

```javascript
slidersPerView: 'auto',
breakpoints: {
    // 当宽度小于等于720
    720: {
        slidesPerView: 1,
        spaceBetween: 0
    }
}
```

* tab导航页面切换，具体实现见源码

```javascript
// 导航项点击交互
$tabItem.on("click", function() {
    var tabIndex = $(this).index();
    pageSwiper.slideTo(tabIndex);
});
```