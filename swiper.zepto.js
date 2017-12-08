/**
 * 移动端Swiper
 * 去掉了视差效果parallax，去掉了双向控制controller
 * 用到的es6语法：includes
 * 需要扩展zepto的data功能
 * 特别点：passiveListener提升页面滑动的流畅度
 * 由于flex-wrap的兼容局限性，不支持多行
 * 由于flex-shrink的兼容局限性，无法使用
 */
(function() {
    'use strict';
    var $ = window.Zepto;

    /*===========================
    Swiper
    ===========================*/
    var Swiper = function(container, params) {
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof
        // instanceof 运算符用来检测 constructor.prototype 是否存在于参数 object 的原型链上
        // object instanceof constructor
        if (!(this instanceof Swiper)) return new Swiper(container, params);

        // 默认配置项
        var defaults = {
            // Slides的滑动方向，可设置水平(horizontal)或垂直(vertical)。
            // http://www.swiper.com.cn/api/basic/2014/1215/21.html
            direction: 'horizontal',
            touchEventsTarget: 'container',
            initialSlide: 0, // Index number of initial slide
            // 滑动速度，即slider自动滑动开始到结束的时间（单位ms），也是触摸滑动时释放至贴合的时间
            speed: 300, // Duration of transition between slides (in ms)
            // autoplay
            autoplay: false, // 自动切换的时间间隔（单位ms），不设定该参数slide不会自动切换。
            autoplayDisableOnInteraction: true, // 用户操作swiper之后，是否禁止autoplay。默认为true：停止。
            // 如果设置为true，当切换到最后一个slide时停止自动切换。（loop模式下无效）。
            // http://www.swiper.com.cn/api/basic/2016/0125/295.html
            autoplayStopOnLast: false,
            // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
            // 设置为true开启IOS的UIWebView环境下的边缘探测。如果拖动是从屏幕边缘开始则不触发swiper。
            iOSEdgeSwipeDetection: false,
            // IOS的UIWebView环境下的边缘探测距离。如果拖动小于边缘探测距离则不触发swiper。
            iOSEdgeSwipeThreshold: 20,
            // Free mode
            // 默认为false，普通模式：slide滑动时只滑动一格，并自动贴合wrapper，设置为true则变为free模式，slide会根据惯性滑动且不会贴合。
            // http://www.swiper.com.cn/api/freemode/2014/1217/44.html
            freeMode: false,
            // free模式动量。free模式下，若设置为false则关闭动量，释放slide之后立即停止不会滑动。
            freeModeMomentum: true,
            // free模式动量值（移动惯量）。设置的值越大，当释放slide时的滑动距离越大。
            freeModeMomentumRatio: 1,
            // 动量反弹。false时禁用free模式下的动量反弹，slides通过惯性滑动到边缘时，无法反弹。注意与resistance（手动抵抗）区分。
            freeModeMomentumBounce: true,
            // 值越大产生的边界反弹效果越明显，反弹距离越大。
            freeModeMomentumBounceRatio: 1,
            // free模式惯性速度，设置越大，释放后滑得越快。
            freeModeMomentumVelocityRatio: 1,
            // 使得freeMode也能自动贴合
            freeModeSticky: false,
            // 最小速度
            freeModeMinimumVelocity: 0.02,
            // Autoheight 自动高度。设置为true时，wrapper和container会随着当前slide的高度而发生变化
            autoHeight: false,
            // 用于嵌套相同方向的swiper时，当切换到子swiper时停止父swiper的切换。
            // 请将子swiper的nested设置为true。
            // 由于需要在slideChangeEnd时判断作用块，因此快速滑动时这个选项无效。
            nested: false,
            // Set wrapper width
            setWrapperSize: false,
            // Virtual Translate 虚拟位移
            // 当你启用这个参数，Swiper除了不会移动外其他的都像平时一样运行，仅仅是不会在Wrapper上设置位移。
            // 当你想自定义一些slide切换效果时可以用。启用这个选项时onSlideChange和onTransition事件失效。
            virtualTranslate: false,
            // Effects
            // slide的切换效果，默认为"slide"（位移切换），可设置为"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）。
            effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
            // coverflow是类似于苹果将多首歌曲的封面以3D界面的形式显示出来的方式。coverflow效果参数，可选值：
            // rotate：slide做3d旋转时Y轴的旋转角度。默认50。
            // stretch：每个slide之间的拉伸值，越大slide靠得越紧。 默认0。
            // depth：slide的位置深度。值越大z轴距离越远，看起来越小。 默认100。
            // modifier：depth和rotate和stretch的倍率，相当于depth*modifier、rotate*modifier、stretch*modifier，值越大这三个参数的效果越明显。默认1。
            // slideShadows：开启slide阴影。默认 true。
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            },
            // 3d翻转有两个参数可设置。
            // slideShadows：slides的阴影。默认true。
            // limitRotation：限制最大旋转角度为180度，默认true。
            flip: {
                slideShadows: true,
                limitRotation: true
            },
            // cube效果参数，可选值：
            // slideShadows：开启slide阴影。默认 true。
            // shadow：开启投影。默认 true。
            // shadowOffset：投影距离。默认 20，单位px。
            // shadowScale：投影缩放比例。默认0.94。
            cube: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94
            },
            // fade效果参数。可选参数：crossFade(3.03启用)，交叉淡入淡出。
            // 默认：false。关闭淡出。过渡时，原slide透明度为1（不淡出），过渡中的slide透明度从0->1（淡入），其他slide透明度0。
            // 可选值：true。开启淡出。过渡时，原slide透明度从1->0（淡出），过渡中的slide透明度从0->1（淡入），其他slide透明度0。
            fade: {
                crossFade: false
            },
            /**
             * Scrollbar 滚动条
             */
            // Scrollbar容器的css选择器或HTML元素
            scrollbar: null,
            // 滚动条是否自动隐藏。默认：true会自动隐藏
            scrollbarHide: true,
            // 该参数设置为true时允许拖动滚动条
            scrollbarDraggable: false,
            // 如果设置为true，释放滚动条时slide自动贴合
            scrollbarSnapOnRelease: false,
            // Hash Navigation
            hashnav: false,
            hashnavWatchState: false,
            // History
            // 设为任意string则开启history并以这个string为URL前缀。
            // 在slide切换时无刷新更换URL和浏览器的history.state(pushState)。这样每个slide都会拥有一个自己的URL。
            // 使用history还必需在slide上增加一个属性data-history，例<div class="swiper-slide" data-history="slide1"></div>
            // 开启history会取消hashnav。
            history: false,
            // Commong Nav State
            // 使用replaceState（window.history.replaceState）方法代替hashnav的hash方法（document.location.hash）
            // 或者history的pushState（window.history.replaceState）方法。
            replaceState: false,
            // Breakpoints
            // 断点设定：根据屏幕宽度设置某参数为不同的值，类似于响应式布局的media screen。
            // 只有部分不需要变换布局方式和逻辑结构的参数支持断点设定，如slidesPerView、slidesPerGroup、spaceBetween，
            // 而像slidesPerColumn、loop、direction、effect等则无效。
            breakpoints: undefined,
            // Slides grid slide之间的距离（单位px）
            // http://www.swiper.com.cn/api/Slides_grid/2015/0308/198.html
            spaceBetween: 0,
            // 设置slider容器能够同时显示的slides数量(carousel模式)。
            // 可以设置为number或者 'auto'则自动根据slides的宽度来设定数量。
            // loop模式下如果设置为'auto'还需要设置另外一个参数loopedSlides。
            // http://www.swiper.com.cn/api/Slides_grid/2014/1215/24.html
            slidesPerView: 1,
            // 多行布局里面每列的slide数量
            slidesPerColumn: 1,
            /**
             * 多行布局中以什么形式填充：
             *  'column'（列）
             *  1   3   5
             *  2   4   6
             *  'row'（行）
             *  1   2   3
             *  4   5   6
             */
            slidesPerColumnFill: 'column',
            // 在carousel mode下定义slides的数量多少为一组
            // http://www.swiper.com.cn/api/Slides_grid/2014/1217/27.html
            slidesPerGroup: 1,
            // 设定为true时，活动块会居中，而不是默认状态下的居左。
            // http://www.swiper.com.cn/api/Slides_grid/2014/1217/50.html
            centeredSlides: false,
            // 设定slide与左边框的预设偏移量（单位px）
            // http://www.swiper.com.cn/api/Slides_grid/2015/0722/282.html
            slidesOffsetBefore: 0, // in px
            // 设定slide与右边框的预设偏移量（单位px）
            // http://www.swiper.com.cn/api/Slides_grid/2015/0722/283.html
            slidesOffsetAfter: 0, // in px
            // Round length
            // 设定为true将slide的宽和高取整(四舍五入)以防止某些分辨率的屏幕上文字或边界(border)模糊。
            // 例如在1440宽度设备上，当你设定slide宽为76%时，则计算出来结果为1094.4，开启后宽度取整数1094。
            roundLengths: false,
            /**
             * Touches 触发条件
             */
            // 触摸距离与slide滑动距离的比率
            // 应用实例：利用touchRatio制作与拖动方向相反的Swiper
            // http://www.swiper.com.cn/api/touch/2014/1217/55.html
            touchRatio: 1,
            // 允许触发拖动的角度值。默认45度，即使触摸方向不是完全水平也能拖动slide。
            // http://www.swiper.com.cn/api/touch/2015/0308/201.html
            touchAngle: 45,
            // 设置为false时，进行快速短距离的拖动无法触发Swiper
            shortSwipes: true,
            // 设置为false时，进行长时间长距离的拖动无法触发Swiper。
            longSwipes: true,
            // 进行longSwipes时触发swiper所需要的最小拖动距离比例，即定义longSwipes距离比例。值越大触发Swiper所需距离越大。最大值0.5。
            longSwipesRatio: 0.5,
            // 定义longSwipes的时间（单位ms），超过则属于longSwipes
            longSwipesMs: 300,
            // 如设置为false，拖动slide时它不会动，当你释放时slide才会切换。
            followFinger: true,
            // 值为true时，slide无法拖动，只能使用扩展API函数例如slideNext() 或slidePrev()或slideTo()等改变slides滑动。
            onlyExternal: false,
            // 拖动的临界值，阀值（单位为px），如果触摸距离小于该值滑块不会被拖动。
            threshold: 0,
            // true时阻止touchmove冒泡事件。
            touchMoveStopPropagation: true,
            // 当滑动到Swiper的边缘时释放滑动，可以用于同向Swiper的嵌套（移动端触摸有效）。
            // http://www.swiper.com.cn/api/touch/2016/1106/327.html
            touchReleaseOnEdges: false,
            // Unique Navigation Elements
            // 独立分页元素，当启用（默认）并且分页元素的传入值为字符串时，swiper会优先查找子元素匹配这些元素。可应用于分页器，按钮和滚动条。
            // http://www.swiper.com.cn/api/pagination/2016/0219/307.html
            uniqueNavElements: true,
            /**
             * Pagination 分页器
             */
            // 分页器容器的css选择器或HTML标签。分页器等组件可以置于container之外，不同Swiper的组件应该有所区分，如#pagination1，#pagination2。
            // http://www.swiper.com.cn/api/pagination/2014/1217/68.html
            pagination: null,
            // 设定分页器指示器（小点）的HTML标签
            paginationElement: 'span',
            // 此参数设置为true时，点击分页器的指示点分页器会控制Swiper切换
            paginationClickable: false,
            // 默认分页器会一直显示。这个选项设置为true时点击Swiper会隐藏/显示分页器
            paginationHide: false,
            // 渲染分页器小点。这个参数允许完全自定义分页器的指示点。接受指示点索引和指示点类名作为参数。
            // http://www.swiper.com.cn/api/pagination/2014/1217/70.html
            paginationBulletRender: null,
            // 自定义进度条类型分页器，当分页器类型设置为进度条时可用。
            // http://www.swiper.com.cn/api/pagination/2016/0126/301.html
            paginationProgressRender: null,
            // 自定义分式类型分页器，当分页器类型设置为分式时可用。
            // http://www.swiper.com.cn/api/pagination/2016/0126/300.html
            paginationFractionRender: null,
            // 自定义特殊类型分页器，当分页器类型设置为自定义时可用。
            // http://www.swiper.com.cn/api/pagination/2016/0126/302.html
            paginationCustomRender: null,
            // 分页器样式类型，可选
            // ‘bullets’ 圆点（默认）
            // ‘fraction’ 分式，数字页码
            // ‘progress’ 进度条
            // ‘custom’ 自定义
            paginationType: 'bullets', // 'bullets' or 'progress' or 'fraction' or 'custom'
            /**
             * resistance 抵抗性
             */
            // 边缘抵抗。当swiper已经处于第一个或最后一个slide时，继续拖动Swiper会离开边界，释放后弹回。边缘抵抗就是拖离边界时的抵抗力。
            // 值为false时禁用，将slide拖离边缘时完全没有抗力。可以通过resistanceRatio设定抵抗力大小。
            resistance: true,
            // 抵抗率。边缘抵抗力的大小比例。值越小抵抗越大越难将slide拖离边缘，0时完全无法拖离。
            resistanceRatio: 0.85,
            /**
             * Next/prev buttons 前进后退按钮
             */
            // 前进按钮的css选择器或HTML元素。
            // http://www.swiper.com.cn/api/Navigation_Buttons/2015/0308/209.html
            nextButton: null,
            // 后退按钮的css选择器或HTML元素。
            prevButton: null,
            // Progress 开启这个参数来计算每个slide的progress(进度、进程)，Swiper的progress无需设置即开启。
            // http://www.swiper.com.cn/api/Progress/2015/0308/191.html
            // 对于slide的progress属性，活动的那个为0，其他的依次减1。例：如果一共有6个slide，活动的是第三个，
            // 从第一个到第六个的progress属性分别是：2、1、0、-1、-2、-3。
            // 对于swiper的progress属性，活动的slide在最左（上）边时为0，活动的slide在最右（下）边时为1，其他情况平分。
            // 例：有6个slide，当活动的是第三个时swiper的progress属性是0.4，当活动的是第五个时swiper的progress属性是0.8。
            // swiper的progress其实就是wrapper的translate值的百分值，与activeIndex等属性不同，
            // progress是随着swiper的切换而不停的变化，而不是在某个时间点突变。
            watchSlidesProgress: false,
            // 开启watchSlidesVisibility选项前需要先开启watchSlidesProgress，
            // 如果开启了watchSlidesVisibility，则会在每个可见slide增加一个classname，默认为'swiper-slide-visible'。
            // http://www.swiper.com.cn/api/Progress/2015/0308/192.html
            watchSlidesVisibility: false,

            /**
             * Clicks 点击
             */
            // 当swiper在触摸时阻止默认事件（preventDefault），用于防止触摸时触发链接跳转。
            // http://www.swiper.com.cn/api/Clicks/2014/1217/40.html
            preventClicks: true,
            // 阻止click冒泡。拖动Swiper时阻止click事件。
            // http://www.swiper.com.cn/api/Clicks/2014/1217/41.html
            preventClicksPropagation: true,
            // 设置为true则点击slide会过渡到这个slide。
            // http://www.swiper.com.cn/api/Clicks/2015/0308/207.html
            slideToClickedSlide: false,
            // Lazy Loading
            // 设为true开启图片延迟加载，使preloadImages无效。
            // 需要将图片img标签的src改写成data-src，并且增加类名swiper-lazy。
            // 背景图的延迟加载则增加属性data-background（3.0.7开始启用）。
            // http://www.swiper.com.cn/api/Images/2015/0308/213.html
            lazyLoading: false,
            // 设置为true允许将延迟加载应用到最接近的slide的图片（前一个和后一个slide）。
            lazyLoadingInPrevNext: false,
            // 设置在延迟加载图片时提前多少个slide。个数不可少于slidesPerView的数量。
            // 默认为1，提前1个slide加载图片，例如切换到第三个slide时加载第四个slide里面的图片。
            lazyLoadingInPrevNextAmount: 1,
            // 默认当过渡到slide后开始加载图片，如果你想在过渡一开始就加载，设置为true
            lazyLoadingOnTransitionStart: false,
            // Images
            // 默认为true，Swiper会强制加载所有图片。
            preloadImages: true,
            // 当所有的内嵌图像（img标签）加载完成后Swiper会重新初始化。使用此选项需要先开启preloadImages: true
            updateOnImagesReady: true,
            /**
             * loop 循环
             */
            // 设置为true 则开启loop循环模式。loop模式：会在原本slide前后复制若干个slide并在合适的时候切换，让Swiper看起来是循环的。
            // loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点。
            loop: false,
            // loop模式下会在slides前后复制若干个slide,，前后复制的个数不会大于原总个数。
            // 默认为0，前后各复制1个。0,1,2 --> 2,0,1,2,0
            // 例：取值为1，0,1,2 --> 1,2,0,1,2,0,1
            // 例：取值为2或以上，0,1,2 --> 0,1,2,0,1,2,0,1,2
            loopAdditionalSlides: 0,
            // 在loop模式下使用slidesPerview:'auto',还需使用该参数设置所要用到的loop个数。
            loopedSlides: null,
            // 使你的活动块指示为最左边的那个slide（没开启centeredSlides时）
            // http://www.swiper.com.cn/api/Controller/2016/1105/322.html
            normalizeSlideIndex: true,
            /**
             * Swiping/no swiping 禁止切换
             */
            // 设为false可禁止向左或上滑动。作用类似mySwiper.lockSwipeToPrev()
            allowSwipeToPrev: true,
            // 设置为false可禁止向右或下滑动。作用类似mySwiper.lockSwipeToNext()
            allowSwipeToNext: true,
            // CSS选择器或者HTML元素。你只能拖动它进行swiping。
            // http://www.swiper.com.cn/api/Swiping/2015/0308/208.html
            swipeHandler: null, //'.swipe-handler',
            // 设为true时，可以在slide上（或其他元素）增加类名'swiper-no-swiping'，使该slide无法拖动，希望文字被选中时可以考虑使用。
            // 该类名可通过noSwipingClass修改。
            noSwiping: true,
            // 不可拖动块的类名，当noSwiping设置为true时，并且在slide加上此类名，slide无法拖动。
            noSwipingClass: 'swiper-no-swiping',
            // Passive Listeners
            // 用来提升swiper在移动设备的中的scroll表现（Passive Event Listeners），
            // 但是会和e.preventDefault冲突，所以有时候你需要关掉它。默认true，开启。
            // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
            // https://zhuanlan.zhihu.com/p/24555031
            passiveListeners: true,
            // NS 容器可修改样式类
            containerModifierClass: 'swiper-container-', // NEW
            // slide样式标识
            slideClass: 'swiper-slide', // 设置slide的类名
            slideActiveClass: 'swiper-slide-active', // 设置活动块的类名
            slideDuplicateActiveClass: 'swiper-slide-duplicate-active', // Loop模式下活动块对应复制块的类名，或者相反
            slideVisibleClass: 'swiper-slide-visible', // 设置可视块的类名
            // 复制的slide的样式标识
            slideDuplicateClass: 'swiper-slide-duplicate', // loop模式下被复制的slide的类名
            slideNextClass: 'swiper-slide-next', // active slide的下一个slide的类名
            slideDuplicateNextClass: 'swiper-slide-duplicate-next', // Loop模式下活动块对应复制块的类名，或者相反
            slidePrevClass: 'swiper-slide-prev', // active slide的前一个slide的类名
            slideDuplicatePrevClass: 'swiper-slide-duplicate-prev', // loop下，前一个slide对应复制块的类名，或者相反
            wrapperClass: 'swiper-wrapper', // 设置wrapper的css类名
            bulletClass: 'swiper-pagination-bullet', // pagination分页器内元素的类名
            bulletActiveClass: 'swiper-pagination-bullet-active', // pagination分页器内活动(active)元素的类名
            buttonDisabledClass: 'swiper-button-disabled', // 前进后退按钮不可用时的类名
            paginationCurrentClass: 'swiper-pagination-current', // 分式类型分页器的当前索引的类名
            paginationTotalClass: 'swiper-pagination-total', // 分式类型分页器总数的类名
            paginationHiddenClass: 'swiper-pagination-hidden', // 分页器隐藏时的类名
            paginationProgressbarClass: 'swiper-pagination-progressbar', // 进度条型分页器的类名
            paginationClickableClass: 'swiper-pagination-clickable', // 可点击的pagination的类名
            paginationModifierClass: 'swiper-pagination-', // 修改以swiper-pagination-为前缀的类名
            lazyLoadingClass: 'swiper-lazy', // 延迟加载的图片的类名
            lazyStatusLoadingClass: 'swiper-lazy-loading', // 正在进行懒加载的元素的类名
            lazyStatusLoadedClass: 'swiper-lazy-loaded', // 懒加载完成的元素的类名
            lazyPreloaderClass: 'swiper-lazy-preloader', // 懒加载预加载元素的类名
            preloaderClass: 'preloader', // 其他预加载的类名

            /**
             * 监视器，观察者
             */
            // Observer
            // http://www.swiper.com.cn/api/Observer/2015/0308/218.html
            // 启动动态检查器(OB/观众/观看者)，当改变swiper的样式（例如隐藏/显示）或者修改swiper的子元素时，自动初始化swiper。
            // 默认false，不开启，可以使用update()方法更新。
            observer: false,
            // 将observe应用于Swiper的父元素。当Swiper的父元素变化时，例如window.resize，Swiper更新。
            // http://www.swiper.com.cn/api/Observer/2015/0308/219.html
            observeParents: false,
            // Callbacks
            // http://www.swiper.com.cn/api/callbacks/2015/0308/220.html
            // 初始化时触发 [Transition/SlideChange] [Start/End] 回调函数。这些回调函数会在下次初始化时被清除如果initialSlide不为0。
            runCallbacksOnInit: true
            /*
            Callbacks:
            onInit: function (swiper)
            onDestroy: function (swiper)
            onBeforeResize: function (swiper)
            onAfterResize: function (swiper)
            onClick: function (swiper, e)
            onTap: function (swiper, e)
            onDoubleTap: function (swiper, e)
            onSliderMove: function (swiper, e)
            onSlideChangeStart: function (swiper)
            onSlideChangeEnd: function (swiper)
            onTransitionStart: function (swiper)
            onTransitionEnd: function (swiper)
            onImagesReady: function (swiper)
            onProgress: function (swiper, progress)
            onTouchStart: function (swiper, e)
            onTouchMove: function (swiper, e)
            onTouchMoveOpposite: function (swiper, e)
            onTouchEnd: function (swiper, e)
            onReachBeginning: function (swiper)
            onReachEnd: function (swiper)
            onSetTransition: function (swiper, duration)
            onSetTranslate: function (swiper, translate)
            onAutoplayStart: function (swiper)
            onAutoplayStop: function (swiper),
            onLazyImageLoad: function (swiper, slide, image)
            onLazyImageReady: function (swiper, slide, image)
            onKeyPress: function (swiper, keyCode)
            */

        };
        // 初始化虚拟位移状态
        var initialVirtualTranslate = params && params.virtualTranslate;

        params = params || {};
        // 保存原始所传参数对象
        var originalParams = {};
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...in
        for (var param in params) {
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
            // 参数为对象深一层次
            if (typeof params[param] === 'object' && params[param] !== null && !(params[param].nodeType ||
                    params[param] === window ||
                    params[param] === document ||
                    (typeof jQuery !== 'undefined' && params[param] instanceof jQuery))) {
                originalParams[param] = {};
                for (var deepParam in params[param]) {
                    originalParams[param][deepParam] = params[param][deepParam];
                }
            } else {
                originalParams[param] = params[param];
            }
        }
        // 未传参项默认参数
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            } else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }

        // Swiper 简写
        var s = this;

        // Params 填补了未传参默认项的所有参数
        s.params = params;
        // 原始所传参数，没有填补未传参默认项
        s.originalParams = originalParams;

        // Classname 样式类名
        s.classNames = [];

        // Export it to Swiper instance 导出给Swiper实例对象
        s.$ = $;

        /*=========================
          Breakpoints
          断点设定：根据屏幕宽度设置某参数为不同的值，类似于响应式布局的media screen。
          只有部分不需要变换布局方式和逻辑结构的参数支持断点设定，如slidesPerView、slidesPerGroup、spaceBetween，
          而像slidesPerColumn、loop、direction、effect等则无效。
          <script>
            var swiper = new Swiper('.swiper-container', {
              slidesPerView: 4,
              spaceBetween: 40,

              breakpoints: {
                //当宽度小于等于320
                320: {
                  slidesPerView: 1,
                  spaceBetweenSlides: 10
                },
               //当宽度小于等于480
                480: {
                  slidesPerView: 2,
                  spaceBetweenSlides: 20
                },
                //当宽度小于等于640
                640: {
                  slidesPerView: 3,
                  spaceBetweenSlides: 30
                }
              }
            })
            </script>
          ===========================*/
        s.currentBreakpoint = undefined;
        // 获取触发的断点
        s.getActiveBreakpoint = function() {
            //Get breakpoint for window width
            if (!s.params.breakpoints) return false;
            var breakpoint = false;
            var points = [],
                point;
            for (point in s.params.breakpoints) {
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
                if (s.params.breakpoints.hasOwnProperty(point)) {
                    points.push(point);
                }
            }
            // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            // 升序
            points.sort(function(a, b) {
                return parseInt(a, 10) > parseInt(b, 10);
            });
            for (var i = 0; i < points.length; i++) {
                point = points[i];
                if (point >= window.innerWidth && !breakpoint) {
                    breakpoint = point;
                }
            }
            return breakpoint || 'max';
        };
        // 更新断点下的参数值
        s.setBreakpoint = function() {
            //Set breakpoint for window width and update parameters
            var breakpoint = s.getActiveBreakpoint();
            if (breakpoint && s.currentBreakpoint !== breakpoint) {
                var breakPointsParams = breakpoint in s.params.breakpoints ? s.params.breakpoints[breakpoint] : s.originalParams;
                // loop模式下如果slidesPerView设置为'auto'还需要设置另外一个参数loopedSlides。
                var needsReLoop = s.params.loop && (breakPointsParams.slidesPerView !== s.params.slidesPerView);
                for (var param in breakPointsParams) {
                    s.params[param] = breakPointsParams[param];
                }
                s.currentBreakpoint = breakpoint;
                if (needsReLoop && s.destroyLoop) {
                    s.reLoop(true);
                }
            }
        };
        // Set breakpoint on load 加载时设置断点
        if (s.params.breakpoints) {
            s.setBreakpoint();
        }

        /*=========================
          Preparation - Define Container, Wrapper and Pagination 准备阶段
          ===========================*/
        s.container = $(container); // 传入的container容器元素
        if (s.container.length === 0) return;
        if (s.container.length > 1) {
            var swipers = [];
            s.container.each(function() {
                var container = this;
                swipers.push(new Swiper(this, params));
            });
            return swipers;
        }

        // Save instance in container HTML Element and in data
        s.container[0].swiper = s;
        s.container.data('swiper', s);

        s.classNames.push(s.params.containerModifierClass + s.params.direction);
        // free模式，惯性模式
        if (s.params.freeMode) {
            s.classNames.push(s.params.containerModifierClass + 'free-mode');
        }
        // 不支持flexbox，特别是flex-wrap安卓4.4才支持
        if (!s.support.flexbox) {
            s.classNames.push(s.params.containerModifierClass + 'no-flexbox');
            // 多行布局里面每列的slide数量
            s.params.slidesPerColumn = 1;
        }
        if (s.params.autoHeight) {
            s.classNames.push(s.params.containerModifierClass + 'autoheight');
        }
        // Enable slides progress when required
        // 开启watchSlidesVisibility选项前需要先开启watchSlidesProgress，
        // 如果开启了watchSlidesVisibility，则会在每个可见slide增加一个classname，默认为'swiper-slide-visible'。
        // http://www.swiper.com.cn/api/Progress/2015/0308/192.html
        if (s.params.watchSlidesVisibility) {
            s.params.watchSlidesProgress = true;
        }
        // Max resistance when touchReleaseOnEdges
        // 当滑动到Swiper的边缘时释放滑动，可以用于同向Swiper的嵌套（移动端触摸有效）。
        // http://www.swiper.com.cn/api/touch/2016/1106/327.html
        if (s.params.touchReleaseOnEdges) {
            // 抵抗率。边缘抵抗力的大小比例。值越小抵抗越大越难将slide拖离边缘，0时完全无法拖离。
            s.params.resistanceRatio = 0;
        }
        // Coverflow / 3D
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
        // indexOf()方法返回在数组中可以找到给定元素的第一个索引，如果不存在，则返回-1
        if (['cube', 'coverflow', 'flip'].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = true;
                s.classNames.push(s.params.containerModifierClass + '3d');
            } else {
                s.params.effect = 'slide';
            }
        }
        if (s.params.effect !== 'slide') {
            s.classNames.push(s.params.containerModifierClass + s.params.effect);
        }
        // if (s.params.effect === 'cube') {
        //     s.params.resistanceRatio = 0;
        //     s.params.slidesPerView = 1;
        //     s.params.slidesPerColumn = 1;
        //     s.params.slidesPerGroup = 1;
        //     s.params.centeredSlides = false;
        //     s.params.spaceBetween = 0;
        //     s.params.virtualTranslate = true;
        // }
        if (s.params.effect === 'fade' || s.params.effect === 'flip') {
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.watchSlidesProgress = true;
            s.params.spaceBetween = 0;
            if (typeof initialVirtualTranslate === 'undefined') {
                s.params.virtualTranslate = true;
            }
        }

        // Wrapper 包裹，包装器
        s.wrapper = s.container.children('.' + s.params.wrapperClass);

        // Pagination 分页器
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (s.params.uniqueNavElements && typeof s.params.pagination === 'string' && s.paginationContainer.length > 1 && s.container.find(s.params.pagination).length === 1) {
                s.paginationContainer = s.container.find(s.params.pagination);
            }

            if (s.params.paginationType === 'bullets' && s.params.paginationClickable) {
                s.paginationContainer.addClass(s.params.paginationModifierClass + 'clickable');
            } else {
                s.params.paginationClickable = false;
            }
            s.paginationContainer.addClass(s.params.paginationModifierClass + s.params.paginationType);
        }
        // Next/Prev Buttons 前进后退按钮
        if (s.params.nextButton || s.params.prevButton) {
            if (s.params.nextButton) {
                s.nextButton = $(s.params.nextButton);
                if (s.params.uniqueNavElements && typeof s.params.nextButton === 'string' && s.nextButton.length > 1 && s.container.find(s.params.nextButton).length === 1) {
                    s.nextButton = s.container.find(s.params.nextButton);
                }
            }
            if (s.params.prevButton) {
                s.prevButton = $(s.params.prevButton);
                if (s.params.uniqueNavElements && typeof s.params.prevButton === 'string' && s.prevButton.length > 1 && s.container.find(s.params.prevButton).length === 1) {
                    s.prevButton = s.container.find(s.params.prevButton);
                }
            }
        }

        // Is Horizontal 是否水平切换
        s.isHorizontal = function() {
            return s.params.direction === 'horizontal';
        };
        // s.isH = isH;

        // RTL 支持
        // https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/dir
        // ltr, 指从左到右，用于那种从左向右书写的语言（比如英语）；
        // rtl, 指从右到左，用于那种从右向左书写的语言（比如阿拉伯语）；
        // auto, 指由用户代理决定方向。它在解析元素中字符时会运用一个基本算法，直到发现一个具有强方向性的字符，然后将这一方向应用于整个元素。
        s.rtl = s.isHorizontal() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
        if (s.rtl) {
            s.classNames.push(s.params.containerModifierClass + 'rtl');
        }

        // Wrong RTL support
        // 错误支持RTL的情况
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
        }

        // Columns
        if (s.params.slidesPerColumn > 1) {
            s.classNames.push(s.params.containerModifierClass + 'multirow');
        }

        // Check for Android
        if (s.device.android) {
            s.classNames.push(s.params.containerModifierClass + 'android');
        }

        // Add classes 统一添加样式类
        s.container.addClass(s.classNames.join(' '));

        // Translate 位移
        s.translate = 0;

        // Progress 进度
        s.progress = 0;

        // Velocity 速度
        s.velocity = 0;

        /*=========================
          Locks, unlocks
          ===========================*/
        // 锁定Swiper的向右或下滑动。可以使用 mySwiper.unlockSwipeToNext() 解锁。作用类似allowSwipeToNext
        s.lockSwipeToNext = function() {
            s.params.allowSwipeToNext = false;
        };
        s.lockSwipeToPrev = function() {
            s.params.allowSwipeToPrev = false;
        };
        s.lockSwipes = function() {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
        };
        s.unlockSwipeToNext = function() {
            s.params.allowSwipeToNext = true;
        };
        s.unlockSwipeToPrev = function() {
            s.params.allowSwipeToPrev = true;
        };
        s.unlockSwipes = function() {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
        };

        /*=========================
          Round helper 四舍五入，可是这里采用的函数不对，待向作者提issue
          ===========================*/
        function round(a) {
            // 向下取整
            // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
            return Math.floor(a);
        }

        /*=========================
          Update on Images Ready
          ===========================*/
        s.imagesToLoad = [];
        s.imagesLoaded = 0;

        s.loadImage = function(imgElement, src, srcset, sizes, checkForComplete, callback) {
            var image;

            function onReady() {
                if (callback) callback();
            }
            if (!imgElement.complete || !checkForComplete) {
                if (src) {
                    image = new window.Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    if (sizes) {
                        image.sizes = sizes;
                    }
                    if (srcset) {
                        image.srcset = srcset;
                    }
                    if (src) {
                        image.src = src;
                    }
                } else {
                    onReady();
                }

            } else { //image already loaded...
                onReady();
            }
        };
        // 预加载
        s.preloadImages = function() {
            s.imagesToLoad = s.container.find('img');

            function _onReady() {
                if (typeof s === 'undefined' || s === null || !s) return;
                if (s.imagesLoaded !== undefined) s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    // 当所有的内嵌图像（img标签）加载完成后Swiper会重新初始化。使用此选项需要先开启preloadImages: true
                    if (s.params.updateOnImagesReady) s.update();
                    s.emit('onImagesReady', s);
                }
            }
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLImageElement
                s.loadImage(s.imagesToLoad[i], (s.imagesToLoad[i].currentSrc || s.imagesToLoad[i].getAttribute('src')), (s.imagesToLoad[i].srcset || s.imagesToLoad[i].getAttribute('srcset')), s.imagesToLoad[i].sizes || s.imagesToLoad[i].getAttribute('sizes'), true, _onReady);
            }
        };


        /*=========================
          Autoplay 自动播放
          ===========================*/
        s.autoplayTimeoutId = undefined;
        s.autoplaying = false;
        s.autoplayPaused = false;
        /**
         * 自动播放
         */
        function autoplay() {
            // 自动切换的时间间隔（单位ms），不设定该参数slide不会自动切换。
            var autoplayDelay = s.params.autoplay;
            var activeSlide = s.slides.eq(s.activeIndex);
            // 你还可以在某个slide上设置单独的停留时间，例<div class="swiper-slide" data-swiper-autoplay="2000">
            // http://www.swiper.com.cn/api/basic/2014/1213/16.html
            if (activeSlide.attr('data-swiper-autoplay')) {
                autoplayDelay = activeSlide.attr('data-swiper-autoplay') || s.params.autoplay;
            }
            s.autoplayTimeoutId = setTimeout(function() {
                // 循环播放
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                    // 触发回调函数
                    s.emit('onAutoplay', s);
                } else {
                    if (!s.isEnd) {
                        s._slideNext();
                        // 触发回调函数
                        s.emit('onAutoplay', s);
                    } else {
                        // autoplayStopOnLast如果设置为true，当切换到最后一个slide时停止自动切换。（loop模式下无效）。
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                            s.emit('onAutoplay', s);
                        } else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, autoplayDelay);
        }
        // 开启自动播放
        s.startAutoplay = function() {
            if (typeof s.autoplayTimeoutId !== 'undefined') return false;
            if (!s.params.autoplay) return false;
            if (s.autoplaying) return false;
            // 自动播放中
            s.autoplaying = true;
            // 触发回调函数
            s.emit('onAutoplayStart', s);
            autoplay();
        };
        // 停止播放
        s.stopAutoplay = function(internal) {
            if (!s.autoplayTimeoutId) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = false;
            s.autoplayTimeoutId = undefined;
            // 触发回调函数
            s.emit('onAutoplayStop', s);
        };
        // 暂停播放，speed切换速度transition duration (in ms)
        s.pauseAutoplay = function(speed) {
            if (s.autoplayPaused) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = true;
            // 切换速度0
            if (speed === 0) {
                s.autoplayPaused = false;
                autoplay();
            } else {
                s.wrapper.transitionEnd(function() {
                    if (!s) return;
                    s.autoplayPaused = false;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    } else {
                        autoplay();
                    }
                });
            }
        };
        /*=========================
          Min/Max Translate 最小最大位移,负值
          ===========================*/
        s.minTranslate = function() {
            return (-s.snapGrid[0]);
        };
        s.maxTranslate = function() {
            return (-s.snapGrid[s.snapGrid.length - 1]);
        };
        /*=========================
          Slider/slides sizes
          ===========================*/
        // 自动高度。设置为true时，wrapper和container会随着当前slide的高度而发生变化。
        s.updateAutoHeight = function() {
            var activeSlides = [];
            var newHeight = 0;
            var i;

            // Find slides currently in view
            if (s.params.slidesPerView !== 'auto' && s.params.slidesPerView > 1) {
                // Math.ceil()向上取整
                for (i = 0; i < Math.ceil(s.params.slidesPerView); i++) {
                    var index = s.activeIndex + i;
                    if (index > s.slides.length) break;
                    activeSlides.push(s.slides.eq(index)[0]); // zepto可改为get(0)
                }
            } else {
                activeSlides.push(s.slides.eq(s.activeIndex)[0]);
            }

            // Find new height from heighest slide in view
            for (i = 0; i < activeSlides.length; i++) {
                if (typeof activeSlides[i] !== 'undefined') {
                    var height = activeSlides[i].offsetHeight;
                    newHeight = height > newHeight ? height : newHeight;
                }
            }

            // Update Height
            if (newHeight) s.wrapper.css('height', newHeight + 'px');
        };
        // 更新container尺寸
        s.updateContainerSize = function() {
            var width, height;
            // 如果显式设置了container的宽度
            if (typeof s.params.width !== 'undefined') {
                width = s.params.width;
            } else {
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/clientWidth
                // 该属性包括内边距，但不包括垂直滚动条（如果有的话）、边框和外边距。
                width = s.container[0].clientWidth;
            }
            // 如果显式设置了container的高度
            if (typeof s.params.height !== 'undefined') {
                height = s.params.height;
            } else {
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/clientHeight
                // 返回元素内部的高度(单位像素)，包含内边距，但不包括水平滚动条、边框和外边距。
                height = s.container[0].clientHeight;
            }
            // 需要保证container里有内容或显式设置了宽或高
            if (width === 0 && s.isHorizontal() || height === 0 && !s.isHorizontal()) {
                return;
            }

            //Subtract paddings 减去内边距
            width = width - parseInt(s.container.css('padding-left'), 10) - parseInt(s.container.css('padding-right'), 10);
            height = height - parseInt(s.container.css('padding-top'), 10) - parseInt(s.container.css('padding-bottom'), 10);

            // Store values 存值
            s.width = width;
            s.height = height;
            s.size = s.isHorizontal() ? s.width : s.height;
        };
        // 更新slide尺寸
        s.updateSlidesSize = function() {
            s.slides = s.wrapper.children('.' + s.params.slideClass);
            // 每组滑块的位置集数组，捕获栅格
            s.snapGrid = [];
            // 滑块的位置集数组
            s.slidesGrid = [];
            // 滑块的尺寸集(宽或高)数组
            s.slidesSizesGrid = [];
            // slide间距
            var spaceBetween = s.params.spaceBetween;
            // slide与左边框的预设偏移量（单位px）
            var slidePosition = -s.params.slidesOffsetBefore;
            var i;
            // 保存前一个slide尺寸
            var prevSlideSize = 0;
            var index = 0;
            // container没有尺寸则退出
            if (typeof s.size === 'undefined') return;
            // 处理百分比传值为数字
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
            }
            // virtualSize 实际尺寸下面for循环累加得出
            s.virtualSize = -spaceBetween;
            // reset margins 重置外边距
            // https://developer.mozilla.org/en-US/docs/Web/CSS/direction
            if (s.rtl) {
                s.slides.css({ marginLeft: '', marginTop: '' });
            } else {
                s.slides.css({ marginRight: '', marginBottom: '' });
            }
            // 填满最后一行后的幻灯片总数或布局能容纳slider个数
            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                // Math.floor()向下取整
                if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                    slidesNumberEvenToRows = s.slides.length;
                } else {
                    // Math.ceil()向上取整
                    slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
                }

                if (s.params.slidesPerView !== 'auto' && s.params.slidesPerColumnFill === 'row') {
                    // Math.max()函数返回一组数中的最大值。
                    slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, s.params.slidesPerView * s.params.slidesPerColumn);
                }
            }

            // Calc slides
            var slideSize; // slide度量大小，水平滑动为宽度，垂直滑动为高度
            var slidesPerColumn = s.params.slidesPerColumn; // 参数设定的每列能容纳slider个数
            // 这里是布局能容纳的每行slider数，这里始终是整数
            var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
            // 未补全前实际最后一行的slider个数
            var numFullColumns = slidesPerRow - (s.params.slidesPerColumn * slidesPerRow - s.slides.length);
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    // Set slides order 设置顺序
                    var newSlideOrderIndex;
                    var column, row;
                    // 按列的顺序走
                    if (s.params.slidesPerColumnFill === 'column') {
                        // Math.floor()向下取整
                        column = Math.floor(i / slidesPerColumn);

                        row = i - column * slidesPerColumn;
                        if (column > numFullColumns || (column === numFullColumns && row === slidesPerColumn - 1)) {
                            if (++row >= slidesPerColumn) {
                                row = 0;
                                column++;
                            }
                        }
                        // 新的顺序索引 newSlideOrderIndex = column + row * (slidesNumberEvenToRows / slidesPerColumn);
                        newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                        slide
                            .css({
                                '-webkit-box-ordinal-group': newSlideOrderIndex,
                                '-webkit-order': newSlideOrderIndex,
                                'order': newSlideOrderIndex
                            });
                    } else {
                        // Math.floor()向下取整
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;
                    }
                    // 照顾其他间距
                    slide
                        .css(
                            'margin-' + (s.isHorizontal() ? 'top' : 'left'),
                            (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                        )
                        .attr('data-swiper-column', column)
                        .attr('data-swiper-row', row);

                }
                if (slide.css('display') === 'none') {
                    continue;
                }
                if (s.params.slidesPerView === 'auto') {
                    // slide大小 左右外边距+offsetWidth 或 上下外边距+offsetHeight
                    slideSize = s.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
                    if (s.params.roundLengths) {
                        slideSize = round(slideSize);
                    }
                } else {
                    slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                    if (s.params.roundLengths) {
                        slideSize = round(slideSize);
                    }

                    if (s.isHorizontal()) {
                        s.slides[i].style.width = slideSize + 'px';
                    } else {
                        s.slides[i].style.height = slideSize + 'px';
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);

                // 如果活动块居中
                if (s.params.centeredSlides) {
                    // 滑块位置
                    slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                    if (prevSlideSize === 0 && i !== 0) {
                        slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    }
                    if (i === 0) {
                        slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    }
                    if (Math.abs(slidePosition) < 1 / 1000) {
                        slidePosition = 0;
                    }
                    // slidesPerGroup在carousel mode下定义slides的数量多少为一组，默认1
                    if ((index) % s.params.slidesPerGroup === 0) {
                        // 每组的位置
                        s.snapGrid.push(slidePosition);
                    }
                    // slide的位置
                    s.slidesGrid.push(slidePosition);
                } else {
                    if ((index) % s.params.slidesPerGroup === 0) {
                        s.snapGrid.push(slidePosition);
                    }
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }
                // 通过累加得出实际尺寸
                s.virtualSize += slideSize + spaceBetween;
                // 保存的前一个slide的尺寸
                prevSlideSize = slideSize;

                index++;
            }
            // 得出最终的实效尺寸
            s.virtualSize = Math.max(s.virtualSize, s.size) + s.params.slidesOffsetAfter;
            var newSlidesGrid;

            // 针对rtl
            if (s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
                s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + 'px' });
            }

            // 如果不支持flexbox或者设定包裹大小为真
            if (!s.support.flexbox || s.params.setWrapperSize) {
                if (s.isHorizontal()) {
                    s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + 'px' });
                } else {
                    s.wrapper.css({ height: s.virtualSize + s.params.spaceBetween + 'px' });
                }
            }

            if (s.params.slidesPerColumn > 1) {
                s.virtualSize = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
                // Math.ceil()向上取整
                s.virtualSize = Math.ceil(s.virtualSize / s.params.slidesPerColumn) - s.params.spaceBetween;

                if (s.isHorizontal()) {
                    s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + 'px' });
                } else {
                    s.wrapper.css({ height: s.virtualSize + s.params.spaceBetween + 'px' });
                }

                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualSize + s.snapGrid[0]) {
                            newSlidesGrid.push(s.snapGrid[i]);
                        }
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }

            // Remove last grid elements depending on width
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualSize - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                // 向上取整
                if (Math.floor(s.virtualSize - s.size) - Math.floor(s.snapGrid[s.snapGrid.length - 1]) > 1) {
                    s.snapGrid.push(s.virtualSize - s.size);
                }
            }
            if (s.snapGrid.length === 0) {
                s.snapGrid = [0];
            }

            if (s.params.spaceBetween !== 0) {
                if (s.isHorizontal()) {
                    if (s.rtl) {
                        s.slides.css({ marginLeft: spaceBetween + 'px' });
                    } else {
                        s.slides.css({ marginRight: spaceBetween + 'px' });
                    }
                } else {
                    s.slides.css({ marginBottom: spaceBetween + 'px' });
                }
            }

            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        // 更新位置信息
        s.updateSlidesOffset = function() {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = s.isHorizontal() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
            }
        };

        /*=========================
          Dynamic Slides Per View
          ===========================*/
        s.currentSlidesPerView = function() {
            var spv = 1,
                i, j;
            if (s.params.centeredSlides) {
                var size = s.slides[s.activeIndex].swiperSlideSize;
                var breakLoop;
                for (i = s.activeIndex + 1; i < s.slides.length; i++) {
                    if (s.slides[i] && !breakLoop) {
                        size += s.slides[i].swiperSlideSize;
                        spv++;
                        if (size > s.size) breakLoop = true;
                    }
                }
                for (j = s.activeIndex - 1; j >= 0; j--) {
                    if (s.slides[j] && !breakLoop) {
                        size += s.slides[j].swiperSlideSize;
                        spv++;
                        if (size > s.size) breakLoop = true;
                    }
                }
            } else {
                for (i = s.activeIndex + 1; i < s.slides.length; i++) {
                    if (s.slidesGrid[i] - s.slidesGrid[s.activeIndex] < s.size) {
                        spv++;
                    }
                }
            }
            return spv;
        };
        /*=========================
          Slider/slides progress 进度
          ===========================*/
        // 对于slide的progress属性，活动的那个为0，其他的依次减1。
        // 例：如果一共有6个slide，活动的是第三个，从第一个到第六个的progress属性分别是：2、1、0、-1、-2、-3。
        s.updateSlidesProgress = function(translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0) return;
            if (typeof s.slides[0].swiperSlideOffset === 'undefined') s.updateSlidesOffset();

            var offsetCenter = -translate;
            if (s.rtl) offsetCenter = translate;

            // Visible Slides
            // http://www.swiper.com.cn/api/namespace/2014/1217/75.html
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                // centeredSlides设定为true时，活动块会居中，而不是默认状态下的居左。
                var slideProgress = (offsetCenter + (s.params.centeredSlides ? s.minTranslate() : 0) - slide.swiperSlideOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
                console.log(slideProgress);
                // 开启watchSlidesVisibility选项前需要先开启watchSlidesProgress，如果开启了watchSlidesVisibility，
                // 则会在每个可见slide增加一个classname，默认为'swiper-slide-visible'。
                // http://www.swiper.com.cn/api/Progress/2015/0308/192.html
                if (s.params.watchSlidesVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible =
                        (slideBefore >= 0 && slideBefore < s.size) ||
                        (slideAfter > 0 && slideAfter <= s.size) ||
                        (slideBefore <= 0 && slideAfter >= s.size);
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        // 更新进度
        s.updateProgress = function(translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            // 最大最小位移差
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            var wasBeginning = s.isBeginning; // 上一次的状态
            var wasEnd = s.isEnd; // 上一次的状态
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = true;
            } else {
                // 进度占比
                s.progress = (translate - s.minTranslate()) / (translatesDiff);
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning && !wasBeginning) {
                // 回调函数
                s.emit('onReachBeginning', s);
            }
            if (s.isEnd && !wasEnd) {
                // 回调函数
                s.emit('onReachEnd', s);
            }
            // 开启这个参数来计算每个slide的progress(进度、进程)，Swiper的progress无需设置即开启。
            // swiper的progress其实就是wrapper的translate值的百分值
            if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
            // 触发回调函数
            s.emit('onProgress', s, s.progress);
        };
        s.updateActiveIndex = function() {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i++) {
                if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                    if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                        newActiveIndex = i;
                    } else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                        newActiveIndex = i + 1;
                    }
                } else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            // Normalize slideIndex
            // normalizeSlideIndex默认为true，使你的活动块指示为最左边的那个slide（没开启centeredSlides时）
            // http://www.swiper.com.cn/api/Controller/2016/1105/322.html
            if (s.params.normalizeSlideIndex) {
                if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
            }
            // for (i = 0; i < s.slidesGrid.length; i++) {
            // if (- translate >= s.slidesGrid[i]) {
            // newActiveIndex = i;
            // }
            // }
            // 向上取整
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;

            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
            s.updateRealIndex();
        };
        // 更新真正的索引
        s.updateRealIndex = function() {
            s.realIndex = parseInt(s.slides.eq(s.activeIndex).attr('data-swiper-slide-index') || s.activeIndex, 10);
        };

        /*=========================
          Classes 更新标识样式
          ===========================*/
        s.updateClasses = function() {
            s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass + ' ' + s.params.slideDuplicateActiveClass + ' ' + s.params.slideDuplicateNextClass + ' ' + s.params.slideDuplicatePrevClass);
            // 活动滑块
            var activeSlide = s.slides.eq(s.activeIndex);
            // Active classes
            activeSlide.addClass(s.params.slideActiveClass);
            if (params.loop) {
                // Duplicate to all looped slides
                if (activeSlide.hasClass(s.params.slideDuplicateClass)) {
                    s.wrapper.children('.' + s.params.slideClass + ':not(.' + s.params.slideDuplicateClass + ')[data-swiper-slide-index="' + s.realIndex + '"]').addClass(s.params.slideDuplicateActiveClass);
                } else {
                    s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass + '[data-swiper-slide-index="' + s.realIndex + '"]').addClass(s.params.slideDuplicateActiveClass);
                }
            }
            // Next Slide
            var nextSlide = activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
            if (s.params.loop && nextSlide.length === 0) {
                nextSlide = s.slides.eq(0);
                nextSlide.addClass(s.params.slideNextClass);
            }
            // Prev Slide
            var prevSlide = activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);
            if (s.params.loop && prevSlide.length === 0) {
                prevSlide = s.slides.eq(-1);
                prevSlide.addClass(s.params.slidePrevClass);
            }
            if (params.loop) {
                // Duplicate to all looped slides
                if (nextSlide.hasClass(s.params.slideDuplicateClass)) {
                    s.wrapper.children('.' + s.params.slideClass + ':not(.' + s.params.slideDuplicateClass + ')[data-swiper-slide-index="' + nextSlide.attr('data-swiper-slide-index') + '"]').addClass(s.params.slideDuplicateNextClass);
                } else {
                    s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass + '[data-swiper-slide-index="' + nextSlide.attr('data-swiper-slide-index') + '"]').addClass(s.params.slideDuplicateNextClass);
                }
                if (prevSlide.hasClass(s.params.slideDuplicateClass)) {
                    s.wrapper.children('.' + s.params.slideClass + ':not(.' + s.params.slideDuplicateClass + ')[data-swiper-slide-index="' + prevSlide.attr('data-swiper-slide-index') + '"]').addClass(s.params.slideDuplicatePrevClass);
                } else {
                    s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass + '[data-swiper-slide-index="' + prevSlide.attr('data-swiper-slide-index') + '"]').addClass(s.params.slideDuplicatePrevClass);
                }
            }

            // Pagination
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                // Current/Total
                var current;
                // 向上取整
                var total = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
                if (s.params.loop) {
                    // 向上取整
                    current = Math.ceil((s.activeIndex - s.loopedSlides) / s.params.slidesPerGroup);
                    if (current > s.slides.length - 1 - s.loopedSlides * 2) {
                        current = current - (s.slides.length - s.loopedSlides * 2);
                    }
                    if (current > total - 1) current = current - total;
                    if (current < 0 && s.params.paginationType !== 'bullets') current = total + current;
                } else {
                    if (typeof s.snapIndex !== 'undefined') {
                        current = s.snapIndex;
                    } else {
                        current = s.activeIndex || 0;
                    }
                }
                // Types
                if (s.params.paginationType === 'bullets' && s.bullets && s.bullets.length > 0) {
                    s.bullets.removeClass(s.params.bulletActiveClass);
                    if (s.paginationContainer.length > 1) {
                        s.bullets.each(function() {
                            if ($(this).index() === current) $(this).addClass(s.params.bulletActiveClass);
                        });
                    } else {
                        s.bullets.eq(current).addClass(s.params.bulletActiveClass);
                    }
                }
                if (s.params.paginationType === 'fraction') {
                    s.paginationContainer.find('.' + s.params.paginationCurrentClass).text(current + 1);
                    s.paginationContainer.find('.' + s.params.paginationTotalClass).text(total);
                }
                if (s.params.paginationType === 'progress') {
                    var scale = (current + 1) / total,
                        scaleX = scale,
                        scaleY = 1;
                    if (!s.isHorizontal()) {
                        scaleY = scale;
                        scaleX = 1;
                    }
                    s.paginationContainer.find('.' + s.params.paginationProgressbarClass).transform('translate3d(0,0,0) scaleX(' + scaleX + ') scaleY(' + scaleY + ')').transition(s.params.speed);
                }
                if (s.params.paginationType === 'custom' && s.params.paginationCustomRender) {
                    s.paginationContainer.html(s.params.paginationCustomRender(s, current + 1, total));
                    // 触发回调函数
                    s.emit('onPaginationRendered', s, s.paginationContainer[0]);
                }
            }

            // Next/active buttons
            if (!s.params.loop) {
                if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) {
                    if (s.isBeginning) {
                        s.prevButton.addClass(s.params.buttonDisabledClass);
                    } else {
                        s.prevButton.removeClass(s.params.buttonDisabledClass);
                    }
                }
                if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) {
                    if (s.isEnd) {
                        s.nextButton.addClass(s.params.buttonDisabledClass);
                    } else {
                        s.nextButton.removeClass(s.params.buttonDisabledClass);
                    }
                }
            }
        };

        /*=========================
          Pagination 分页器
          ===========================*/
        s.updatePagination = function() {
            if (!s.params.pagination) {
                return;
            }
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var paginationHTML = '';
                // 圆点
                if (s.params.paginationType === 'bullets') {
                    // 圆点数量 Math.ceil()向上取整
                    var numberOfBullets = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
                    for (var i = 0; i < numberOfBullets; i++) {
                        if (s.params.paginationBulletRender) {
                            // http://www.swiper.com.cn/api/pagination/2014/1217/70.html
                            // paginationBulletRender: function (swiper, index, className) {
                            //     return '<span class="' + className + '">' + (index + 1) + '</span>';
                            // }
                            paginationHTML += s.params.paginationBulletRender(s, i, s.params.bulletClass);
                        } else {
                            paginationHTML += '<' + s.params.paginationElement + ' class="' + s.params.bulletClass + '"></' + s.params.paginationElement + '>';
                        }
                    }
                    s.paginationContainer.html(paginationHTML);
                    s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
                }
                // 分式
                if (s.params.paginationType === 'fraction') {
                    if (s.params.paginationFractionRender) {
                        paginationHTML = s.params.paginationFractionRender(s, s.params.paginationCurrentClass, s.params.paginationTotalClass);
                    } else {
                        paginationHTML =
                            '<span class="' + s.params.paginationCurrentClass + '"></span>' +
                            ' / ' +
                            '<span class="' + s.params.paginationTotalClass + '"></span>';
                    }
                    s.paginationContainer.html(paginationHTML);
                }
                // 进度条
                if (s.params.paginationType === 'progress') {
                    if (s.params.paginationProgressRender) {
                        paginationHTML = s.params.paginationProgressRender(s, s.params.paginationProgressbarClass);
                    } else {
                        paginationHTML = '<span class="' + s.params.paginationProgressbarClass + '"></span>';
                    }
                    s.paginationContainer.html(paginationHTML);
                }
                if (s.params.paginationType !== 'custom') {
                    // 触发回道
                    s.emit('onPaginationRendered', s, s.paginationContainer[0]);
                }
            }
        };
        /*=========================
          Common update method 公共更新方法
          ===========================*/
        s.update = function(updateTranslate) {
            if (!s) return;
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            // 传参数并存在scrollbar方法
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            var newTranslate;

            function forceSetTranslate() {
                var translate = s.rtl ? -s.translate : s.translate;
                newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated;

                if (s.params.freeMode) {
                    forceSetTranslate();
                    if (s.params.autoHeight) {
                        s.updateAutoHeight();
                    }
                } else {
                    if ((s.params.slidesPerView === 'auto' || s.params.slidesPerView > 1) && s.isEnd && !s.params.centeredSlides) {
                        translated = s.slideTo(s.slides.length - 1, 0, false, true);
                    } else {
                        translated = s.slideTo(s.activeIndex, 0, false, true);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }
            } else if (s.params.autoHeight) {
                s.updateAutoHeight();
            }
        };

        /*=========================
          Resize Handler
          ===========================*/
        s.onResize = function(forceUpdatePagination) {
            // 回调
            if (s.params.onBeforeResize) s.params.onBeforeResize(s);
            //Breakpoints
            if (s.params.breakpoints) {
                s.setBreakpoint();
            }

            // Disable locks on resize
            var allowSwipeToPrev = s.params.allowSwipeToPrev;
            var allowSwipeToNext = s.params.allowSwipeToNext;
            s.params.allowSwipeToPrev = s.params.allowSwipeToNext = true;

            s.updateContainerSize();
            s.updateSlidesSize();
            if (s.params.slidesPerView === 'auto' || s.params.freeMode || forceUpdatePagination) s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }

            var slideChangedBySlideTo = false;
            if (s.params.freeMode) {
                var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();

                if (s.params.autoHeight) {
                    s.updateAutoHeight();
                }
            } else {
                s.updateClasses();
                if ((s.params.slidesPerView === 'auto' || s.params.slidesPerView > 1) && s.isEnd && !s.params.centeredSlides) {
                    slideChangedBySlideTo = s.slideTo(s.slides.length - 1, 0, false, true);
                } else {
                    slideChangedBySlideTo = s.slideTo(s.activeIndex, 0, false, true);
                }
            }
            if (s.params.lazyLoading && !slideChangedBySlideTo && s.lazy) {
                s.lazy.load();
            }
            // Return locks after resize
            s.params.allowSwipeToPrev = allowSwipeToPrev;
            s.params.allowSwipeToNext = allowSwipeToNext;
            // 回调
            if (s.params.onAfterResize) s.params.onAfterResize(s);
        };

        /*=========================
          Events 事件定义
          ===========================*/
        // Attach/detach events 绑定或解绑
        // 初始化事件
        s.initEvents = function(detach) {
            var actionDom = detach ? 'off' : 'on';
            var action = detach ? 'removeEventListener' : 'addEventListener';
            var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
            var target = touchEventsTarget;
            // 动作捕捉，冒泡还是捕获
            // nested用于嵌套相同方向的swiper时，当切换到子swiper时停止父swiper的切换。
            // 请将子swiper的nested设置为true。
            // 由于需要在slideChangeEnd时判断作用块，因此快速滑动时这个选项无效。
            var moveCapture = s.params.nested ? true : false;

            //Touch Events
            var passiveListener = s.support.passiveListener && s.params.passiveListeners ? { passive: true, capture: false } : false;

            touchEventsTarget[action]('touchstart', s.onTouchStart, passiveListener);
            touchEventsTarget[action]('touchmove', s.onTouchMove, moveCapture);
            touchEventsTarget[action]('touchend', s.onTouchEnd, passiveListener);

            window[action]('resize', s.onResize);

            // Next, Prev, Index
            if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) {
                s.nextButton[actionDom]('click', s.onClickNext);
            }
            if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) {
                s.prevButton[actionDom]('click', s.onClickPrev);
            }
            if (s.params.pagination && s.params.paginationClickable) {
                s.paginationContainer[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
            }

            // Prevent Links Clicks
            if (s.params.preventClicks || s.params.preventClicksPropagation) {
                touchEventsTarget[action]('click', s.preventClicks, true);
            }
        };
        // 绑定事件
        s.attachEvents = function() {
            s.initEvents();
        };
        // 解绑事件
        s.detachEvents = function() {
            s.initEvents(true);
        };

        /*=========================
          Handle Clicks 处理点击
          ===========================*/
        // Prevent Clicks
        s.allowClick = true;
        s.preventClicks = function(e) {
            // 不允许点击
            if (!s.allowClick) {
                if (s.params.preventClicks) e.preventDefault();
                if (s.params.preventClicksPropagation && s.animating) {
                    // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation
                    // 阻止事件冒泡
                    e.stopPropagation();
                    // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation
                    // 阻止调用相同事件的其他侦听器。
                    e.stopImmediatePropagation();
                }
            }
        };
        // Clicks
        s.onClickNext = function(e) {
            e.preventDefault();
            // 最后一个并且不支持循环模式
            if (s.isEnd && !s.params.loop) {
                return;
            }
            s.slideNext();
        };
        s.onClickPrev = function(e) {
            e.preventDefault();
            // 第一个并且不支持循环模式
            if (s.isBeginning && !s.params.loop) {
                return;
            }
            s.slidePrev();
        };
        s.onClickIndex = function(e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop) {
                index = index + s.loopedSlides;
            }
            s.slideTo(index);
        };

        /*=========================
          Handle Touches 处理触摸事件
          ===========================*/
        /**
         * 检测触发事件的对象或其父类是否为指定的选择器并返回该选择器
         * @param  {[type]} e        指代事件
         * @param  {[type]} selector 指定选择器
         * @return {[type]}          指定选择器元素或undefined
         */
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === 'string') {
                    el = el.parents(selector);
                } else if (selector.nodeType) {
                    var found;
                    el.parents().each(function(index, _el) {
                        if (_el === selector) {
                            found = selector;
                        }
                    });
                    if (!found) {
                        return undefined;
                    } else {
                        return selector;
                    }
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function(e) {
            var slide = findElementInEvent(e, '.' + s.params.slideClass);
            var slideFound = false;
            if (slide) {
                for (var i = 0; i < s.slides.length; i++) {
                    if (s.slides[i] === slide) slideFound = true;
                }
            }

            if (slide && slideFound) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            } else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
                var slideToIndex = s.clickedIndex,
                    realIndex,
                    duplicatedSlides,
                    slidesPerView = s.params.slidesPerView === 'auto' ? s.currentSlidesPerView() : s.params.slidesPerView;
                if (s.params.loop) {
                    if (s.animating) return;
                    realIndex = parseInt($(s.clickedSlide).attr('data-swiper-slide-index'), 10);
                    if (s.params.centeredSlides) {
                        if ((slideToIndex < s.loopedSlides - slidesPerView / 2) || (slideToIndex > s.slides.length - s.loopedSlides + slidesPerView / 2)) {
                            s.fixLoop();
                            slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]:not(.' + s.params.slideDuplicateClass + ')').eq(0).index();
                            setTimeout(function() {
                                s.slideTo(slideToIndex);
                            }, 0);
                        } else {
                            s.slideTo(slideToIndex);
                        }
                    } else {
                        if (slideToIndex > s.slides.length - slidesPerView) {
                            s.fixLoop();
                            slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]:not(.' + s.params.slideDuplicateClass + ')').eq(0).index();
                            setTimeout(function() {
                                s.slideTo(slideToIndex);
                            }, 0);
                        } else {
                            s.slideTo(slideToIndex);
                        }
                    }
                } else {
                    s.slideTo(slideToIndex);
                }
            }
        };
        // 触摸状态
        var isTouched;
        var isMoved;
        // 允许touch回调
        var allowTouchCallbacks;
        var touchStartTime;
        // 正在滚动
        var isScrolling;
        var currentTranslate;
        var startTranslate;
        // 允许阈移
        var allowThresholdMove;
        // Form elements to match
        var formElements = 'input, select, textarea, button, video';
        // Last click time
        var lastClickTime = Date.now();
        var clickTimeout;
        // Velocities 速度
        var velocities = [];
        // 允许动量反弹
        var allowMomentumBounce;

        // Animating Flag 正在动画过程中标记
        s.animating = false;

        // Touches information
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
        };

        // Touch handlers
        var isTouchEvent;
        var startMoving;
        s.onTouchStart = function(e) {
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/type
            isTouchEvent = e.type === 'touchstart';
            if (!isTouchEvent) return;
            // noSwiping设为true时，可以在slide上（或其他元素）增加类名'swiper-no-swiping'，使该slide无法拖动，希望文字被选中时可以考虑使用。
            // 该类名可通过noSwipingClass修改。
            if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
                // 允许点击
                s.allowClick = true;
                return;
            }
            // CSS选择器或者HTML元素。你只能拖动它进行swiping。
            // http://www.swiper.com.cn/api/Swiping/2015/0308/208.html
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler)) return;
            }

            var startX = s.touches.currentX = e.targetTouches[0].pageX;
            var startY = s.touches.currentY = e.targetTouches[0].pageY;

            // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore
            // iOSEdgeSwipeDetection设置为true开启IOS的UIWebView环境下的边缘探测。如果拖动是从屏幕边缘开始则不触发swiper。
            // iOSEdgeSwipeThreshold IOS的UIWebView环境下的边缘探测距离。如果拖动小于边缘探测距离则不触发swiper。
            if (s.device.ios && s.params.iOSEdgeSwipeDetection && startX <= s.params.iOSEdgeSwipeThreshold) {
                return;
            }
            isTouched = true;
            isMoved = false;
            // 允许touch回调
            allowTouchCallbacks = true;
            // 在滚动状态
            isScrolling = undefined;
            startMoving = undefined;
            s.touches.startX = startX;
            s.touches.startY = startY;
            // 触摸开始时间
            touchStartTime = Date.now();
            s.allowClick = true;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            // threshold拖动的临界值，阀值（单位为px），如果触摸距离小于该值滑块不会被拖动。
            if (s.params.threshold > 0) allowThresholdMove = false;
            if (e.type !== 'touchstart') {
                var preventDefault = true;
                if ($(e.target).is(formElements)) preventDefault = false;
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/activeElement
                if (document.activeElement && $(document.activeElement).is(formElements)) {
                    document.activeElement.blur();
                }
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            s.emit('onTouchStart', s, e);
        };

        s.onTouchMove = function(e) {
            // 通过嵌套的滑块阻止
            if (e.preventedByNestedSwiper) {
                s.touches.startX = e.targetTouches[0].pageX;
                s.touches.startY = e.targetTouches[0].pageY;
                return;
            }
            // onlyExternal值为true时，slide无法拖动，只能使用扩展API函数例如slideNext()或slidePrev()或slideTo()等改变slides滑动。
            if (s.params.onlyExternal) {
                // isMoved = true;
                s.allowClick = false;
                if (isTouched) {
                    s.touches.startX = s.touches.currentX = e.targetTouches[0].pageX;
                    s.touches.startY = s.touches.currentY = e.targetTouches[0].pageY;
                    touchStartTime = Date.now();
                }
                return;
            }
            // touchReleaseOnEdges当滑动到Swiper的边缘时释放滑动，可以用于同向Swiper的嵌套（移动端触摸有效）。
            // 注意s.maxTranslate()和s.minTranslate()都是负值
            if (isTouchEvent && s.params.touchReleaseOnEdges && !s.params.loop) {
                if (!s.isHorizontal()) {
                    // Vertical
                    if (
                        (s.touches.currentY < s.touches.startY && s.translate <= s.maxTranslate()) ||
                        (s.touches.currentY > s.touches.startY && s.translate >= s.minTranslate())
                    ) {
                        return;
                    }
                } else {
                    if (
                        (s.touches.currentX < s.touches.startX && s.translate <= s.maxTranslate()) ||
                        (s.touches.currentX > s.touches.startX && s.translate >= s.minTranslate())
                    ) {
                        return;
                    }
                }
            }
            if (isTouchEvent && document.activeElement) {
                if (e.target === document.activeElement && $(e.target).is(formElements)) {
                    isMoved = true;
                    s.allowClick = false;
                    return;
                }
            }
            // 允许touch回调
            if (allowTouchCallbacks) {
                s.emit('onTouchMove', s, e);
            }
            // 非一点触控
            if (e.targetTouches && e.targetTouches.length > 1) return;

            s.touches.currentX = e.targetTouches[0].pageX;
            s.touches.currentY = e.targetTouches[0].pageY;

            if (typeof isScrolling === 'undefined') {
                var touchAngle;
                if (s.isHorizontal() && s.touches.currentY === s.touches.startY || !s.isHorizontal() && s.touches.currentX === s.touches.startX) {
                    isScrolling = false;
                } else {
                    // Math.atan2(y, x)  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
                    // atan2 方法返回一个 -pi 到 pi 之间的数值，表示点 (x, y) 对应的偏移角度。
                    // 这是一个逆时针角度，以弧度为单位，正X轴和点 (x, y) 与原点连线 之间。注意此函数接受的参数：先传递 y 坐标，然后是 x 坐标。
                    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
                    touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
                    // touchAngle允许触发拖动的角度值。默认45度，即使触摸方向不是完全水平也能拖动slide。
                    // 只要在这个角度内触摸Swiper都可拖动
                    isScrolling = s.isHorizontal() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
                }
            }
            if (isScrolling) {
                // http://www.swiper.com.cn/api/callbacks/2015/0308/223.html
                // 如果拖动角度大于允许角度触发,当手指触碰Swiper并且没有按照direction设定的方向移动时执行,此时页面滚动
                s.emit('onTouchMoveOpposite', s, e);
            }
            if (typeof startMoving === 'undefined') {
                if (s.touches.currentX !== s.touches.startX || s.touches.currentY !== s.touches.startY) {
                    // 开始移动
                    startMoving = true;
                }
            }
            if (!isTouched) return;
            if (isScrolling) {
                isTouched = false;
                return;
            }
            if (!startMoving) {
                return;
            }
            s.allowClick = false;
            // 回调函数，手指触碰Swiper并拖动slide时执行。
            s.emit('onSliderMove', s, e);
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }

            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger('webkitTransitionEnd transitionend');
                }
                if (s.params.autoplay && s.autoplaying) {
                    // 用户操作swiper之后，是否禁止autoplay。默认为true：停止。
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    } else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = false;
            }
            isMoved = true;

            var diff = s.touches.diff = s.isHorizontal() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;

            diff = diff * s.params.touchRatio;
            if (s.rtl) diff = -diff;

            s.swipeDirection = diff > 0 ? 'prev' : 'next';
            currentTranslate = diff + startTranslate;

            var disableParentSwiper = true;
            if ((diff > 0 && currentTranslate > s.minTranslate())) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
            } else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
            }

            if (disableParentSwiper) {
                e.preventedByNestedSwiper = true;
            }

            // Directions locks
            if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
                currentTranslate = startTranslate;
            }


            // Threshold
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = s.isHorizontal() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                        return;
                    }
                } else {
                    currentTranslate = startTranslate;
                    return;
                }
            }

            if (!s.params.followFinger) return;

            // Update active index in free mode
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                //Velocity
                if (velocities.length === 0) {
                    velocities.push({
                        position: s.touches[s.isHorizontal() ? 'startX' : 'startY'],
                        time: touchStartTime
                    });
                }
                velocities.push({
                    position: s.touches[s.isHorizontal() ? 'currentX' : 'currentY'],
                    time: (new window.Date()).getTime()
                });
            }
            // Update progress
            s.updateProgress(currentTranslate);
            // Update translate
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function(e) {
            if (e.originalEvent) e = e.originalEvent;
            if (allowTouchCallbacks) {
                s.emit('onTouchEnd', s, e);
            }
            allowTouchCallbacks = false;
            if (!isTouched) return;

            // Time diff
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;

            // Tap, doubleTap, Click
            if (s.allowClick) {
                s.updateClickedSlide(e);
                s.emit('onTap', s, e);
                if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function() {
                        if (!s) return;
                        if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                            s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                        }
                        s.emit('onClick', s, e);
                    }, 300);

                }
                if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    s.emit('onDoubleTap', s, e);
                }
            }

            lastClickTime = Date.now();
            setTimeout(function() {
                if (s) s.allowClick = true;
            }, 0);

            if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
                isTouched = isMoved = false;
                return;
            }
            isTouched = isMoved = false;

            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            } else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                } else if (currentPos > -s.maxTranslate()) {
                    if (s.slides.length < s.snapGrid.length) {
                        s.slideTo(s.snapGrid.length - 1);
                    } else {
                        s.slideTo(s.slides.length - 1);
                    }
                    return;
                }

                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(),
                            velocityEvent = velocities.pop();

                        var distance = lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (Math.abs(s.velocity) < s.params.freeModeMinimumVelocity) {
                            s.velocity = 0;
                        }
                        // this implies that the user stopped moving a finger then released.
                        // There would be no events with distance zero, so the last event is stale.
                        if (time > 150 || (new window.Date().getTime() - lastMoveEvent.time) > 300) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }
                    s.velocity = s.velocity * s.params.freeModeMomentumVelocityRatio;

                    velocities.length = 0;
                    var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;

                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl) newPosition = -newPosition;
                    var doBounce = false;
                    var afterBouncePosition;
                    var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition + s.maxTranslate() < -bounceAmount) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        } else {
                            newPosition = s.maxTranslate();
                        }
                    } else if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        } else {
                            newPosition = s.minTranslate();
                        }
                    } else if (s.params.freeModeSticky) {
                        var j = 0,
                            nextSlide;
                        for (j = 0; j < s.snapGrid.length; j += 1) {
                            if (s.snapGrid[j] > -newPosition) {
                                nextSlide = j;
                                break;
                            }

                        }
                        if (Math.abs(s.snapGrid[nextSlide] - newPosition) < Math.abs(s.snapGrid[nextSlide - 1] - newPosition) || s.swipeDirection === 'next') {
                            newPosition = s.snapGrid[nextSlide];
                        } else {
                            newPosition = s.snapGrid[nextSlide - 1];
                        }
                        if (!s.rtl) newPosition = -newPosition;
                    }
                    //Fix duration
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                        } else {
                            momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                        }
                    } else if (s.params.freeModeSticky) {
                        s.slideReset();
                        return;
                    }

                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = true;
                        s.wrapper.transitionEnd(function() {
                            if (!s || !allowMomentumBounce) return;
                            s.emit('onMomentumBounce', s);

                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function() {
                                if (!s) return;
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = true;
                            s.wrapper.transitionEnd(function() {
                                if (!s) return;
                                s.onTransitionEnd();
                            });
                        }

                    } else {
                        s.updateProgress(newPosition);
                    }

                    s.updateActiveIndex();
                }
                if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }

            // Find current slide
            var i, stopIndex = 0,
                groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                    if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                    }
                } else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }

            // Find current slide size
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;

            if (timeDiff > s.params.longSwipesMs) {
                // Long touches
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);

                }
                if (s.swipeDirection === 'prev') {
                    if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
            } else {
                // Short swipes
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);

                }
                if (s.swipeDirection === 'prev') {
                    s.slideTo(stopIndex);
                }
            }
        };
        /*=========================
          Transitions 过渡
          ===========================*/
        s._slideTo = function(slideIndex, speed) {
            return s.slideTo(slideIndex, speed, true, true);
        };
        /**
         * Swiper切换到指定slide
         * @param  {Number} slideIndex   滑块索引，指定将要切换到的slide的索引
         * @param  {Number} speed        切换速度transition duration (in ms)
         * @param  {Boolen} runCallbacks 是否回调
         * @param  {Boolen} internal     内部优先
         */
        s.slideTo = function(slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (typeof slideIndex === 'undefined') slideIndex = 0;
            if (slideIndex < 0) slideIndex = 0;
            // 索引，向下取整
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
            // 位移
            var translate = -s.snapGrid[s.snapIndex];
            // Stop autoplay 停止自动播放
            if (s.params.autoplay && s.autoplaying) {
                // autoplayDisableOnInteraction用户操作swiper之后，是否禁止autoplay。默认为true：停止。
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    // 暂停
                    s.pauseAutoplay(speed);
                } else {
                    // 停止
                    s.stopAutoplay();
                }
            }
            // Update progress
            s.updateProgress(translate);

            // Normalize slideIndex
            // normalizeSlideIndex使你的活动块指示为最左边的那个slide（没开启centeredSlides时）
            // http://www.swiper.com.cn/api/Controller/2016/1105/322.html
            if (s.params.normalizeSlideIndex) {
                for (var i = 0; i < s.slidesGrid.length; i++) {
                    if (-Math.floor(translate * 100) >= Math.floor(s.slidesGrid[i] * 100)) {
                        slideIndex = i;
                    }
                }
            }

            // Directions locks 方向锁
            if (!s.params.allowSwipeToNext && translate < s.translate && translate < s.minTranslate()) {
                return false;
            }
            if (!s.params.allowSwipeToPrev && translate > s.translate && translate > s.maxTranslate()) {
                if ((s.activeIndex || 0) !== slideIndex) return false;
            }

            // Update Index
            // 滑动速度，即slider自动滑动开始到结束的时间（单位ms），也是触摸滑动时释放至贴合的时间
            if (typeof speed === 'undefined') speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;
            // 更新真正的索引
            s.updateRealIndex();
            if ((s.rtl && -translate === s.translate) || (!s.rtl && translate === s.translate)) {
                // Update Height
                if (s.params.autoHeight) {
                    s.updateAutoHeight();
                }
                s.updateClasses();
                if (s.params.effect !== 'slide') {
                    s.setWrapperTranslate(translate);
                }
                return false;
            }
            s.updateClasses();
            // runCallbacksOnInit初始化时触发 [Transition/SlideChange] [Start/End] 回调函数。
            // 这些回调函数会在下次初始化时被清除如果initialSlide不为0。
            s.onTransitionStart(runCallbacks);

            if (speed === 0) {
                s.setWrapperTranslate(translate);
                s.setWrapperTransition(0);
                s.onTransitionEnd(runCallbacks);
            } else {
                s.setWrapperTranslate(translate);
                s.setWrapperTransition(speed);
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function() {
                        if (!s) return;
                        s.onTransitionEnd(runCallbacks);
                    });
                }

            }

            return true;
        };
        s.onTransitionStart = function(runCallbacks) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (s.params.autoHeight) {
                s.updateAutoHeight();
            }
            if (s.lazy) s.lazy.onTransitionStart();
            // 触发回调
            if (runCallbacks) {
                s.emit('onTransitionStart', s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit('onSlideChangeStart', s);
                    if (s.activeIndex > s.previousIndex) {
                        s.emit('onSlideNextStart', s);
                    } else {
                        s.emit('onSlidePrevStart', s);
                    }
                }

            }
        };
        s.onTransitionEnd = function(runCallbacks) {
            s.animating = false;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (s.lazy) s.lazy.onTransitionEnd();
            if (runCallbacks) {
                s.emit('onTransitionEnd', s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit('onSlideChangeEnd', s);
                    if (s.activeIndex > s.previousIndex) {
                        s.emit('onSlideNextEnd', s);
                    } else {
                        s.emit('onSlidePrevEnd', s);
                    }
                }
            }
            if (s.params.history && s.history) {
                s.history.setHistory(s.params.history, s.activeIndex);
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }

        };
        s.slideNext = function(runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            } else {
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            }
        };
        s._slideNext = function(speed) {
            return s.slideNext(true, speed, true);
        };
        s.slidePrev = function(runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
            } else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        };
        s._slidePrev = function(speed) {
            return s.slidePrev(true, speed, true);
        };
        s.slideReset = function(runCallbacks, speed, internal) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };

        s.disableTouchControl = function() {
            s.params.onlyExternal = true;
            return true;
        };
        s.enableTouchControl = function() {
            s.params.onlyExternal = false;
            return true;
        };

        /*=========================
          Translate/transition helpers 帮助类
          ===========================*/
        s.setWrapperTransition = function(duration) {
            s.wrapper.transition(duration);
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }

            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            s.emit('onSetTransition', s, duration);
        };
        /**
         * [setWrapperTranslate description]
         * @param {Number} translate         位移量
         * @param {Boolen} updateActiveIndex 是否更新活动索引
         */
        s.setWrapperTranslate = function(translate, updateActiveIndex) {
            var x = 0,
                y = 0,
                z = 0;
            if (s.isHorizontal()) {
                x = s.rtl ? -translate : translate;
            } else {
                y = translate;
            }
            // 四舍五入
            if (s.params.roundLengths) {
                x = round(x);
                y = round(y);
            }
            // 虚拟位移。当你启用这个参数，Swiper除了不会移动外其他的都像平时一样运行，仅仅是不会在Wrapper上设置位移。
            // 当你想自定义一些slide切换效果时可以用。启用这个选项时onSlideChange和onTransition事件失效。
            if (!s.params.virtualTranslate) {
                if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
                else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
            }

            s.translate = s.isHorizontal() ? x : y;

            // Check if we need to update progress
            var progress;
            // 最大最小位移差
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                progress = 0;
            } else {
                progress = (translate - s.minTranslate()) / (translatesDiff);
            }
            if (progress !== s.progress) {
                s.updateProgress(translate);
            }

            if (updateActiveIndex) s.updateActiveIndex();
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            // 滚动条
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }

            // 触发回调函数
            s.emit('onSetTranslate', s, s.translate);
        };

        s.getTranslate = function(el, axis) {
            var matrix; // 矩阵
            var curTransform;
            var curStyle;
            var transformMatrix;

            // automatic axis detection 自动轴检测
            if (typeof axis === 'undefined') {
                axis = 'x';
            }

            if (s.params.virtualTranslate) {
                return s.rtl ? -s.translate : s.translate;
            }

            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                curTransform = curStyle.transform || curStyle.webkitTransform;
                if (curTransform.split(',').length > 6) {
                    curTransform = curTransform.split(', ').map(function(a) {
                        return a.replace(',', '.');
                    }).join(', ');
                }
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
            } else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }

            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform) curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function(axis) {
            if (typeof axis === 'undefined') {
                axis = s.isHorizontal() ? 'x' : 'y';
            }
            return s.getTranslate(s.wrapper[0], axis);
        };

        /*=========================
          Observer 监视器，观察者
          启动动态检查器(OB/观众/观看者)，当改变swiper的样式（例如隐藏/显示）或者修改swiper的子元素时，自动初始化swiper。
          默认false，不开启，可以使用update()方法更新。
          ===========================*/
        s.observers = [];
        // 初始化
        function initObserver(target, options) {
            options = options || {};
            // create an observer instance
            // https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
            // MutationObserver变动观察器给开发者们提供了一种能在某个范围内的DOM树发生变化时作出适当反应的能力.
            // childList：子元素的变动
            // attributes：属性的变动
            // characterData：节点内容或节点文本的变动
            // subtree：所有下属节点（包括子节点和子节点的子节点）的变动
            // 想要观察哪一种变动类型，就在option对象中指定它的值为true。需要注意的是，不能单独观察subtree变动，必须同时指定childList、attributes和characterData中的一种或多种。
            // 除了变动类型，option对象还可以设定以下属性：
            // attributeOldValue：值为true或者为false。如果为true，则表示需要记录变动前的属性值。
            // characterDataOldValue：值为true或者为false。如果为true，则表示需要记录变动前的数据值。
            // attributesFilter：值为一个数组，表示需要观察的特定属性（比如['class', 'str']）。
            var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function(mutations) {
                mutations.forEach(function(mutation) {
                    s.onResize(true);
                    s.emit('onObserverUpdate', s, mutation);
                });
            });
            // observer对象的observer方法
            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: typeof options.childList === 'undefined' ? true : options.childList,
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData
            });

            s.observers.push(observer);
        }
        s.initObservers = function() {
            // observeParents 将observe应用于Swiper的父元素。当Swiper的父元素变化时，例如window.resize，Swiper更新。
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }

            // Observe container
            initObserver(s.container[0], { childList: false });

            // Observe wrapper
            initObserver(s.wrapper[0], { attributes: false });
        };
        s.disconnectObservers = function() {
            for (var i = 0; i < s.observers.length; i++) {
                // disconnect方法用来停止观察。发生相应变动时，不再调用回调函数。
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        /*=========================
          Loop 循环
          ===========================*/
        // Create looped slides
        // 创建可循环的滑块
        s.createLoop = function() {
            // Remove duplicated(复制的) slides
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
            // 获取所有的滑块
            var slides = s.wrapper.children('.' + s.params.slideClass);
            // 在loop模式下使用slidesPerview:'auto',还需使用该参数设置所要用到的loop个数。
            if (s.params.slidesPerView === 'auto' && !s.params.loopedSlides) s.params.loopedSlides = slides.length;
            // 在loop模式下使用slidesPerview:'auto',还需使用该参数设置所要用到的loop个数，默认传参为null取slidersPerView的个数
            s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
            // loop模式下会在slides前后复制若干个slide，前后复制的个数不会大于原总个数，loopAdditionalSlides默认为0
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }
            // 向前追加的滑块，向后追加的滑块
            var prependSlides = [],
                appendSlides = [],
                i;
            slides.each(function(index, el) {
                var slide = $(this);
                if (index < s.loopedSlides) appendSlides.push(el);
                if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
                slide.attr('data-swiper-slide-index', index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/cloneNode
                s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
        };
        s.destroyLoop = function() {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
            s.slides.removeAttr('data-swiper-slide-index');
        };
        s.reLoop = function(updatePosition) {
            var oldIndex = s.activeIndex - s.loopedSlides;
            s.destroyLoop();
            s.createLoop();
            s.updateSlidesSize();
            if (updatePosition) {
                s.slideTo(oldIndex + s.loopedSlides, 0, false);
            }
        };
        // 修正循环
        s.fixLoop = function() {
            var newIndex;
            //Fix For Negative Oversliding(负位)
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
            //Fix For Positive Oversliding(正位)
            else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
        };
        /*=========================
          Append/Prepend/Remove Slides
          ===========================*/
        s.appendSlide = function(slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.append(slides[i]);
                }
            } else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
        };
        s.prependSlide = function(slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            } else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeSlide = function(slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
                s.slides = s.wrapper.children('.' + s.params.slideClass);
            }
            var newActiveIndex = s.activeIndex,
                indexToRemove;
            if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex) newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            } else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex) newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }

            if (s.params.loop) {
                s.createLoop();
            }

            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            if (s.params.loop) {
                s.slideTo(newActiveIndex + s.loopedSlides, 0, false);
            } else {
                s.slideTo(newActiveIndex, 0, false);
            }

        };
        s.removeAllSlides = function() {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };


        /*=========================
          Effects
          ===========================*/
        s.effects = {
            fade: {
                setTranslate: function() {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset;
                        if (!s.params.virtualTranslate) tx = tx - s.translate;
                        var ty = 0;
                        if (!s.isHorizontal()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade ?
                            Math.max(1 - Math.abs(slide[0].progress), 0) :
                            1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        slide
                            .css({
                                opacity: slideOpacity
                            })
                            .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');

                    }

                },
                setTransition: function(duration) {
                    s.slides.transition(duration);
                    if (s.params.virtualTranslate && duration !== 0) {
                        var eventTriggered = false;
                        s.slides.transitionEnd(function() {
                            if (eventTriggered) return;
                            if (!s) return;
                            eventTriggered = true;
                            s.animating = false;
                            var triggerEvents = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
                            for (var i = 0; i < triggerEvents.length; i++) {
                                s.wrapper.trigger(triggerEvents[i]);
                            }
                        });
                    }
                }
            },
            flip: {
                setTranslate: function() {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var progress = slide[0].progress;
                        if (s.params.flip.limitRotation) {
                            progress = Math.max(Math.min(slide[0].progress, 1), -1);
                        }
                        var offset = slide[0].swiperSlideOffset;
                        var rotate = -180 * progress,
                            rotateY = rotate,
                            rotateX = 0,
                            tx = -offset,
                            ty = 0;
                        if (!s.isHorizontal()) {
                            ty = tx;
                            tx = 0;
                            rotateX = -rotateY;
                            rotateY = 0;
                        } else if (s.rtl) {
                            rotateY = -rotateY;
                        }

                        slide[0].style.zIndex = -Math.abs(Math.round(progress)) + s.slides.length;

                        if (s.params.flip.slideShadows) {
                            //Set shadows
                            var shadowBefore = s.isHorizontal() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = s.isHorizontal() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (s.isHorizontal() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (s.isHorizontal() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
                            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
                        }

                        slide
                            .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)');
                    }
                },
                setTransition: function(duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                    if (s.params.virtualTranslate && duration !== 0) {
                        var eventTriggered = false;
                        s.slides.eq(s.activeIndex).transitionEnd(function() {
                            if (eventTriggered) return;
                            if (!s) return;
                            if (!$(this).hasClass(s.params.slideActiveClass)) return;
                            eventTriggered = true;
                            s.animating = false;
                            var triggerEvents = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
                            for (var i = 0; i < triggerEvents.length; i++) {
                                s.wrapper.trigger(triggerEvents[i]);
                            }
                        });
                    }
                }
            }
        };

        /*=========================
          Images Lazy Loading 懒加载
          ===========================*/
        s.lazy = {
            initialImageLoaded: false,
            loadImageInSlide: function(index, loadInDuplicate) {
                if (typeof index === 'undefined') return;
                if (typeof loadInDuplicate === 'undefined') loadInDuplicate = true;
                if (s.slides.length === 0) return;

                var slide = s.slides.eq(index);
                console.log(slide);
                var img = slide.find('.' + s.params.lazyLoadingClass).not('.' + s.params.lazyStatusLoadedClass).not('.' + s.params.lazyStatusLoadingClass);
                if (slide.hasClass(s.params.lazyLoadingClass) && !slide.hasClass(s.params.lazyStatusLoadedClass) && !slide.hasClass(s.params.lazyStatusLoadingClass)) {
                    img = img.add(slide[0]);
                }
                if (img.length === 0) return;

                img.each(function() {
                    var _img = $(this);
                    _img.addClass(s.params.lazyStatusLoadingClass);
                    var background = _img.attr('data-background');
                    var src = _img.attr('data-src'),
                        srcset = _img.attr('data-srcset'),
                        sizes = _img.attr('data-sizes');
                    s.loadImage(_img[0], (src || background), srcset, sizes, false, function() {
                        if (typeof s === 'undefined' || s === null || !s) return;
                        if (background) {
                            _img.css('background-image', 'url("' + background + '")');
                            _img.removeAttr('data-background');
                        } else {
                            if (srcset) {
                                _img.attr('srcset', srcset);
                                _img.removeAttr('data-srcset');
                            }
                            if (sizes) {
                                _img.attr('sizes', sizes);
                                _img.removeAttr('data-sizes');
                            }
                            if (src) {
                                _img.attr('src', src);
                                _img.removeAttr('data-src');
                            }

                        }

                        _img.addClass(s.params.lazyStatusLoadedClass).removeClass(s.params.lazyStatusLoadingClass);
                        slide.find('.' + s.params.lazyPreloaderClass + ', .' + s.params.preloaderClass).remove();
                        if (s.params.loop && loadInDuplicate) {
                            var slideOriginalIndex = slide.attr('data-swiper-slide-index');
                            if (slide.hasClass(s.params.slideDuplicateClass)) {
                                var originalSlide = s.wrapper.children('[data-swiper-slide-index="' + slideOriginalIndex + '"]:not(.' + s.params.slideDuplicateClass + ')');
                                s.lazy.loadImageInSlide(originalSlide.index(), false);
                            } else {
                                var duplicatedSlide = s.wrapper.children('.' + s.params.slideDuplicateClass + '[data-swiper-slide-index="' + slideOriginalIndex + '"]');
                                s.lazy.loadImageInSlide(duplicatedSlide.index(), false);
                            }
                        }
                        s.emit('onLazyImageReady', s, slide[0], _img[0]);
                    });

                    s.emit('onLazyImageLoad', s, slide[0], _img[0]);
                });

            },
            load: function() {
                var i;
                var slidesPerView = s.params.slidesPerView;
                if (slidesPerView === 'auto') {
                    slidesPerView = 0;
                }
                if (!s.lazy.initialImageLoaded) s.lazy.initialImageLoaded = true;
                if (s.params.watchSlidesVisibility) {
                    s.wrapper.children('.' + s.params.slideVisibleClass).each(function() {
                        s.lazy.loadImageInSlide($(this).index());
                    });
                } else {
                    if (slidesPerView > 1) {
                        for (i = s.activeIndex; i < s.activeIndex + slidesPerView; i++) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                    } else {
                        s.lazy.loadImageInSlide(s.activeIndex);
                    }
                }
                if (s.params.lazyLoadingInPrevNext) {
                    if (slidesPerView > 1 || (s.params.lazyLoadingInPrevNextAmount && s.params.lazyLoadingInPrevNextAmount > 1)) {
                        var amount = s.params.lazyLoadingInPrevNextAmount;
                        var spv = slidesPerView;
                        var maxIndex = Math.min(s.activeIndex + spv + Math.max(amount, spv), s.slides.length);
                        var minIndex = Math.max(s.activeIndex - Math.max(spv, amount), 0);
                        // Next Slides
                        for (i = s.activeIndex + slidesPerView; i < maxIndex; i++) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                        // Prev Slides
                        for (i = minIndex; i < s.activeIndex; i++) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                    } else {
                        var nextSlide = s.wrapper.children('.' + s.params.slideNextClass);
                        if (nextSlide.length > 0) s.lazy.loadImageInSlide(nextSlide.index());

                        var prevSlide = s.wrapper.children('.' + s.params.slidePrevClass);
                        if (prevSlide.length > 0) s.lazy.loadImageInSlide(prevSlide.index());
                    }
                }
            },
            onTransitionStart: function() {
                if (s.params.lazyLoading) {
                    if (s.params.lazyLoadingOnTransitionStart || (!s.params.lazyLoadingOnTransitionStart && !s.lazy.initialImageLoaded)) {
                        s.lazy.load();
                    }
                }
            },
            onTransitionEnd: function() {
                if (s.params.lazyLoading && !s.params.lazyLoadingOnTransitionStart) {
                    s.lazy.load();
                }
            }
        };

        /*=========================
          Scrollbar 滚动条
          ===========================*/
        s.scrollbar = {
            isTouched: false,
            setDragPosition: function(e) {
                var sb = s.scrollbar;
                var x = 0,
                    y = 0;
                var translate;
                // 点坐标
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/type
                // https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Touch
                var pointerPosition = s.isHorizontal() ?
                    ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageX : e.pageX || e.clientX) :
                    ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageY : e.pageY || e.clientY);
                // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetLeft
                // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetTop
                var position = (pointerPosition) - sb.track.offset()[s.isHorizontal() ? 'left' : 'top'] - sb.dragSize / 2;
                var positionMin = -s.minTranslate() * sb.moveDivider;
                var positionMax = -s.maxTranslate() * sb.moveDivider;
                if (position < positionMin) {
                    position = positionMin;
                } else if (position > positionMax) {
                    position = positionMax;
                }
                position = -position / sb.moveDivider;
                s.updateProgress(position);
                s.setWrapperTranslate(position, true);
            },
            dragStart: function(e) {
                var sb = s.scrollbar;
                // 已经触摸
                sb.isTouched = true;
                // 阻止默认行为
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault
                e.preventDefault();
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation
                // 阻止捕获和冒泡阶段中当前事件的进一步传播。
                e.stopPropagation();

                sb.setDragPosition(e);
                clearTimeout(sb.dragTimeout);

                sb.track.transition(0);
                // 滚动条是否自动隐藏。默认：true会自动隐藏
                if (s.params.scrollbarHide) {
                    sb.track.css('opacity', 1);
                }
                s.wrapper.transition(100);
                sb.drag.transition(100);
                // 触发回调函数
                s.emit('onScrollbarDragStart', s);
            },
            dragMove: function(e) {
                var sb = s.scrollbar;
                if (!sb.isTouched) return;
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = false;
                sb.setDragPosition(e);
                s.wrapper.transition(0);
                sb.track.transition(0);
                sb.drag.transition(0);
                // 触发回调函数
                s.emit('onScrollbarDragMove', s);
            },
            dragEnd: function(e) {
                var sb = s.scrollbar;
                if (!sb.isTouched) return;
                sb.isTouched = false;
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.dragTimeout);
                    sb.dragTimeout = setTimeout(function() {
                        sb.track.css('opacity', 0);
                        sb.track.transition(400);
                    }, 1000);

                }
                // 触发回调函数
                s.emit('onScrollbarDragEnd', s);
                // 如果设置为true，释放滚动条时slide自动贴合
                if (s.params.scrollbarSnapOnRelease) {
                    s.slideReset();
                }
            },
            enableDraggable: function() {
                var sb = s.scrollbar;
                var target = sb.track;
                $(sb.track).on('touchstart', sb.dragStart);
                $(target).on('touchmove', sb.dragMove);
                $(target).on('touchend', sb.dragEnd);
            },
            disableDraggable: function() {
                var sb = s.scrollbar;
                var target = sb.track;
                $(sb.track).off('touchstart', sb.dragStart);
                $(target).off('touchmove', sb.dragMove);
                $(target).off('touchend', sb.dragEnd);
            },
            set: function() {
                if (!s.params.scrollbar) {
                    return;
                }
                var sb = s.scrollbar;
                // 滚道，scrollbar容器的css选择器或HTML元素
                sb.track = $(s.params.scrollbar);
                // 保持独一无二
                if (s.params.uniqueNavElements && typeof s.params.scrollbar === 'string' && sb.track.length > 1 && s.container.find(s.params.scrollbar).length === 1) {
                    sb.track = s.container.find(s.params.scrollbar);
                }
                // 拖拽
                sb.drag = sb.track.find('.swiper-scrollbar-drag');
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = '';
                sb.drag[0].style.height = '';
                // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetWidth
                // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetHeight
                sb.trackSize = s.isHorizontal() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
                // 分比 container的size/实效尺寸
                sb.divider = s.size / s.virtualSize;
                // 移动分比
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                // 滚轴大小
                sb.dragSize = sb.trackSize * sb.divider;

                if (s.isHorizontal()) {
                    sb.drag[0].style.width = sb.dragSize + 'px';
                } else {
                    sb.drag[0].style.height = sb.dragSize + 'px';
                }

                if (sb.divider >= 1) {
                    sb.track[0].style.display = 'none';
                } else {
                    sb.track[0].style.display = '';
                }
                // 滚动条是否自动隐藏。默认：true会自动隐藏
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function() {
                if (!s.params.scrollbar) return;
                var diff;
                var sb = s.scrollbar;
                // 位移量
                var translate = s.translate || 0;
                var newPos;

                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && s.isHorizontal()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    } else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                } else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    } else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (s.isHorizontal()) {
                    if (s.support.transforms3d) {
                        sb.drag.transform('translate3d(' + (newPos) + 'px, 0, 0)');
                    } else {
                        sb.drag.transform('translateX(' + (newPos) + 'px)');
                    }
                    sb.drag[0].style.width = newSize + 'px';
                } else {
                    if (s.support.transforms3d) {
                        sb.drag.transform('translate3d(0px, ' + (newPos) + 'px, 0)');
                    } else {
                        sb.drag.transform('translateY(' + (newPos) + 'px)');
                    }
                    sb.drag[0].style.height = newSize + 'px';
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function() {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function(duration) {
                if (!s.params.scrollbar) return;
                s.scrollbar.drag.transition(duration);
            }
        };



        /*=========================
          Hash Navigation
          ===========================*/
        s.hashnav = {
            onHashCange: function(e, a) {
                var newHash = document.location.hash.replace('#', '');
                var activeSlideHash = s.slides.eq(s.activeIndex).attr('data-hash');
                if (newHash !== activeSlideHash) {
                    s.slideTo(s.wrapper.children('.' + s.params.slideClass + '[data-hash="' + (newHash) + '"]').index());
                }
            },
            attachEvents: function(detach) {
                var action = detach ? 'off' : 'on';
                $(window)[action]('hashchange', s.hashnav.onHashCange);
            },
            setHash: function() {
                if (!s.hashnav.initialized || !s.params.hashnav) return;
                if (s.params.replaceState && window.history && window.history.replaceState) {
                    window.history.replaceState(null, null, ('#' + s.slides.eq(s.activeIndex).attr('data-hash') || ''));
                } else {
                    var slide = s.slides.eq(s.activeIndex);
                    var hash = slide.attr('data-hash') || slide.attr('data-history');
                    document.location.hash = hash || '';
                }
            },
            init: function() {
                if (!s.params.hashnav || s.params.history) return;
                s.hashnav.initialized = true;
                var hash = document.location.hash.replace('#', '');
                if (hash) {
                    var speed = 0;
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideHash = slide.attr('data-hash') || slide.attr('data-history');
                        if (slideHash === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
                            var index = slide.index();
                            s.slideTo(index, speed, s.params.runCallbacksOnInit, true);
                        }
                    }
                }
                if (s.params.hashnavWatchState) s.hashnav.attachEvents();
            },
            destroy: function() {
                if (s.params.hashnavWatchState) s.hashnav.attachEvents(true);
            }
        };


        /*=========================
          History Api with fallback to Hashnav
          ===========================*/
        s.history = {
            init: function() {
                if (!s.params.history) return;
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/history
                // 不支持history的改为hash的方式
                if (!window.history || !window.history.pushState) {
                    s.params.history = false;
                    s.params.hashnav = true;
                    return;
                }
                s.history.initialized = true;
                this.paths = this.getPathValues();
                if (!this.paths.key && !this.paths.value) return;
                this.scrollToSlide(0, this.paths.value, s.params.runCallbacksOnInit);
                if (!s.params.replaceState) {
                    window.addEventListener('popstate', this.setHistoryPopState);
                }
            },
            setHistoryPopState: function() {
                s.history.paths = s.history.getPathValues();
                s.history.scrollToSlide(s.params.speed, s.history.paths.value, false);
            },
            getPathValues: function() {
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/slice
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split
                var pathArray = window.location.pathname.slice(1).split('/');
                var total = pathArray.length;
                var key = pathArray[total - 2];
                var value = pathArray[total - 1];
                return { key: key, value: value };
            },
            setHistory: function(key, index) {
                if (!s.history.initialized || !s.params.history) return;
                var slide = s.slides.eq(index);
                var value = this.slugify(slide.attr('data-history'));
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/includes
                // es6语法 需要转换
                if (!window.location.pathname.includes(key)) {
                    value = key + '/' + value;
                }
                if (s.params.replaceState) {
                    window.history.replaceState(null, null, value);
                } else {
                    window.history.pushState(null, null, value);
                }
            },
            slugify: function(text) {
                return text.toString().toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '');
            },
            scrollToSlide: function(speed, value, runCallbacks) {
                if (value) {
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        // 使用history还必需在slide上增加一个属性data-history，例<div class="swiper-slide" data-history="slide1"></div>
                        var slideHistory = this.slugify(slide.attr('data-history'));
                        if (slideHistory === value && !slide.hasClass(s.params.slideDuplicateClass)) {
                            var index = slide.index();
                            s.slideTo(index, speed, runCallbacks);
                        }
                    }
                } else {
                    s.slideTo(0, speed, runCallbacks);
                }
            }
        };

        /*=========================
          Plugins API. Collect all and init all plugins
          ===========================*/
        s._plugins = [];
        for (var plugin in s.plugins) {
            var p = s.plugins[plugin](s, s.params[plugin]);
            if (p) s._plugins.push(p);
        }
        // Method to call all plugins event/method
        s.callPlugins = function(eventName) {
            for (var i = 0; i < s._plugins.length; i++) {
                if (eventName in s._plugins[i]) {
                    s._plugins[i][eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
        };


        /*=========================
          Events/Callbacks/Plugins Emitter 发射器
          ===========================*/
        // 标准化事件名称
        function normalizeEventName(eventName) {
            // 如果'on'不在字符串首部
            if (eventName.indexOf('on') !== 0) {
                if (eventName[0] !== eventName[0].toUpperCase()) {
                    eventName = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
                } else {
                    eventName = 'on' + eventName;
                }
            }
            return eventName;
        }
        s.emitterEventListeners = {};
        s.emit = function(eventName) {
            // Trigger callbacks 触发器回调函数
            if (s.params[eventName]) {
                s.params[eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
            }
            var i;
            // Trigger events
            if (s.emitterEventListeners[eventName]) {
                for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                    s.emitterEventListeners[eventName][i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
            // Trigger plugins
            if (s.callPlugins) s.callPlugins(eventName, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        };
        s.on = function(eventName, handler) {
            eventName = normalizeEventName(eventName);
            if (!s.emitterEventListeners[eventName]) {
                s.emitterEventListeners[eventName] = [];
            }
            s.emitterEventListeners[eventName].push(handler);
            return s;
        };
        s.off = function(eventName, handler) {
            var i;
            eventName = normalizeEventName(eventName);
            if (typeof handler === 'undefined') {
                // Remove all handlers for such event
                s.emitterEventListeners[eventName] = [];
                return s;
            }
            if (!s.emitterEventListeners[eventName] || s.emitterEventListeners[eventName].length === 0) return;
            for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                if (s.emitterEventListeners[eventName][i] === handler) s.emitterEventListeners[eventName].splice(i, 1);
            }
            return s;
        };
        s.once = function(eventName, handler) {
            eventName = normalizeEventName(eventName);
            var _handler = function() {
                handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                s.off(eventName, _handler);
            };
            s.on(eventName, _handler);
            return s;
        };

        /*=========================
          Init/Destroy 初始化/销毁
          ===========================*/
        s.init = function() {
            // 如果开启循环模式，则创建循环结构
            if (s.params.loop) {
                s.createLoop();
            }
            // 更新container尺寸
            s.updateContainerSize();
            // 更新slide尺寸
            s.updateSlidesSize();
            // 分页器
            s.updatePagination();
            // 传参并且存在scrollbar方法
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
                if (s.params.scrollbarDraggable) {
                    // 开启拖动
                    s.scrollbar.enableDraggable();
                }
            }

            if (s.params.loop) {
                s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
            } else {
                s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
                if (s.params.initialSlide === 0) {
                    if (s.lazy && s.params.lazyLoading) {
                        s.lazy.load();
                        s.lazy.initialImageLoaded = true;
                    }
                }
            }
            // 绑定事件
            s.attachEvents();
            // 如果监视器方法存在
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.preloadImages && !s.params.lazyLoading) {
                s.preloadImages();
            }
            // 自动播放
            if (s.params.autoplay) {
                s.startAutoplay();
            }

            if (s.params.history) {
                if (s.history) s.history.init();
            }
            if (s.params.hashnav) {
                if (s.hashnav) s.hashnav.init();
            }
            // 回调函数
            s.emit('onInit', s);
        };

        // Cleanup dynamic styles
        s.cleanupStyles = function() {
            // Container
            s.container.removeClass(s.classNames.join(' ')).removeAttr('style');

            // Wrapper
            s.wrapper.removeAttr('style');

            // Slides
            if (s.slides && s.slides.length) {
                s.slides
                    .removeClass([
                        s.params.slideVisibleClass,
                        s.params.slideActiveClass,
                        s.params.slideNextClass,
                        s.params.slidePrevClass
                    ].join(' '))
                    .removeAttr('style')
                    .removeAttr('data-swiper-column')
                    .removeAttr('data-swiper-row');
            }

            // Pagination/Bullets
            if (s.paginationContainer && s.paginationContainer.length) {
                s.paginationContainer.removeClass(s.params.paginationHiddenClass);
            }
            if (s.bullets && s.bullets.length) {
                s.bullets.removeClass(s.params.bulletActiveClass);
            }

            // Buttons
            if (s.params.prevButton) $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
            if (s.params.nextButton) $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);

            // Scrollbar
            if (s.params.scrollbar && s.scrollbar) {
                if (s.scrollbar.track && s.scrollbar.track.length) s.scrollbar.track.removeAttr('style');
                if (s.scrollbar.drag && s.scrollbar.drag.length) s.scrollbar.drag.removeAttr('style');
            }
        };

        // Destroy
        s.destroy = function(deleteInstance, cleanupStyles) {
            // Detach evebts
            s.detachEvents();
            // Stop autoplay
            s.stopAutoplay();
            // Disable draggable
            if (s.params.scrollbar && s.scrollbar) {
                if (s.params.scrollbarDraggable) {
                    s.scrollbar.disableDraggable();
                }
            }
            // Destroy loop
            if (s.params.loop) {
                s.destroyLoop();
            }
            // Cleanup styles
            if (cleanupStyles) {
                s.cleanupStyles();
            }
            // Disconnect observer
            s.disconnectObservers();

            // Delete history popstate
            if (s.params.history && !s.params.replaceState) {
                window.removeEventListener('popstate', s.history.setHistoryPopState);
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.destroy();
            }
            // Destroy callback
            s.emit('onDestroy');
            // Delete instance
            if (deleteInstance !== false) s = null;
        };
        // 初始化
        s.init();

        // Return swiper instance
        return s;
    };

    /*==================================================
    Prototype 原型
    ====================================================*/
    Swiper.prototype = {
        isSafari: (function() {
            var ua = window.navigator.userAgent.toLowerCase();
            return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent),
        isArray: function(arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        },
        /*==================================================
        Devices
        ====================================================*/
        device: (function() {
            var ua = window.navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
            return {
                ios: ipad || iphone || ipod,
                android: android
            };
        })(),
        /*==================================================
        Feature Detection 功能检测探测
        ====================================================*/
        support: {
            transforms3d: (window.Modernizr && Modernizr.csstransforms3d === true) || (function() {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'perspective' in div);
            })(),

            flexbox: (function() {
                return false;
                var div = document.createElement('div').style;
                // 侧轴上的对齐方式 align-items、 -webkit-align-items、-webkit-box-align
                // 伸缩流垂直方向 flex-direction、-webkit-box-direction、-webkit-box-orient
                var styles = ('alignItems webkitAlignItems webkitBoxAlign webkitFlexDirection webkitBoxDirection webkitBoxOrient').split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return true;
                }
            })(),

            observer: (function() {
                return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
            })(),

            passiveListener: (function() {
                // 被动
                // passive https://zhuanlan.zhihu.com/p/24555031 检测是否支持passive
                // http://www.cnblogs.com/ziyunfei/p/5545439.html
                var supportsPassive = false;
                try {
                    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
                    var opts = Object.defineProperty({}, 'passive', {
                        get: function() {
                            supportsPassive = true;
                        }
                    });
                    // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
                    window.addEventListener('testPassiveListener', null, opts);
                } catch (e) {}
                return supportsPassive;
            })(),

            gestures: (function() {
                return 'ongesturestart' in window;
            })()
        },
        /*==================================================
        Plugins
        ====================================================*/
        plugins: {}
    };

    /*===========================
     Get Dom libraries
     ===========================*/
    addLibraryPlugin(window['Zepto']);
    // Required DOM Plugins
    var domLib = window.Zepto;

    /*===========================
    Add .swiper plugin from Dom libraries
    ===========================*/
    function addLibraryPlugin(lib) {
        lib.fn.swiper = function(params) {
            var firstInstance;
            lib(this).each(function() {
                var s = new Swiper(this, params);
                if (!firstInstance) firstInstance = s;
            });
            return firstInstance;
        };
    }
    /**
     * 赋予dom类库一些swiper的特定功能
     */
    if (domLib) {
        if (!('transitionEnd' in domLib.fn)) {
            domLib.fn.transitionEnd = function(callback) {
                var events = ['webkitTransitionEnd', 'transitionend'],
                    i, j, dom = this;

                function fireCallBack(e) {
                    /*jshint validthis:true */
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            };
        }
        if (!('transform' in domLib.fn)) {
            domLib.fn.transform = function(transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            };
        }
        if (!('transition' in domLib.fn)) {
            domLib.fn.transition = function(duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            };
        }
        if (!('outerWidth' in domLib.fn)) {
            domLib.fn.outerWidth = function(includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
                    else
                        return this[0].offsetWidth;
                } else return null;
            };
        }
    }

    window.Swiper = Swiper;
})();