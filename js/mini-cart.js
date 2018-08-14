theme.miniCart = (function () {

  var init = function() {
    console.log('miniCart.init');

    // VARS
    var self = this,
        $miniCart = $('[data-mini-basket]'),
        $itemsContainer = $('[data-mini-basket-ajax-items]'), // where we will put updated mini cart items
        productFormSelector = '[data-mini-basket-product-form]',
        productFormBtnSelector = '[data-mini-basket-product-form-btn]',
        statusElementSelector = '[data-mini-basket-status]',
        $submittedForm = $('[data-mini-basket-form]'),
        cartData = {},
        removeTriggerSelector = '[data-mini-basket-item-remove]',
        quantityDropdownSelector = '[data-mini-basket-item-qty]',
        $bundleOverlays = $("[data-collection-item-overlay]");



    // FN: AJAX ADD
    function addItemToCart(data) {

      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: data,
        dataType: 'json',
        beforeSend: function() {
          $submittedForm.find(productFormBtnSelector).prop('disabled',true).addClass(theme.classes.processing);
          $submittedForm.find(statusElementSelector).addClass(theme.classes.processing);
        }
      }).done(function(itemData) { // if successful
        cartData = updateCartData(); // get cart data after update
      }).fail(function(xhr,textStatus) { // if fail
        handleMiniBasketError('Failed to add to cart',textStatus,xhr);
      });
    };

    // FN: REMOVE ITEM
    function removeMiniBasketItem(requestURL,$trigger,giftItem) {
      $.ajax({
        type: 'POST',
        url: requestURL,
        beforeSend: function() {
          toggleCheckoutButton(false);
          $trigger.addClass(theme.classes.processing);
        }
      }).done(function(data) { // if successful
        updateCartData();
      }).fail(function(xhr,textStatus) { // if fail
        handleMiniBasketError('Failed to remove item',textStatus,xhr);
        $trigger.removeClass(theme.classes.processing);
      }).always(function() {
        toggleCheckoutButton(true);
      });
    }



    // REMOVE BUNDLE ITEMS FROM CART
    function updateMiniBasketBundleItemQty(bundleLineItems) {

      var dataObj = {
        updates: bundleLineItems
      }

      $.ajax({
        type: 'POST',
        data: dataObj,
        url: '/cart/update.js',
        dataType: "json",
        beforeSend: function() {
          toggleCheckoutButton(false);
        }
      }).done(function(data) { // if successful
        updateCartData();
      }).fail(function(xhr,textStatus) { // if fail
        handleMiniBasketError('Failed to update item quantity',textStatus,xhr);
      }).always(function() {
        toggleCheckoutButton(true);
      });

    };



    // FN: GET UPDATED MINI BASKET
    function updateMiniBasket() {

      // go get updated cart
      $.get({
        url: '/cart?view=mini-basket-ajax'
      }).done(function(newBasketItems) { // if successful

        console.log('Updated mini-basket');

        // Add updated cart data
        $newBasketItems = $.parseHTML(newBasketItems);
        $itemsContainer.html($newBasketItems);

        if (typeof $submittedForm !== 'undefined') {
          $submittedForm.find(statusElementSelector).removeClass(theme.classes.processing);
          $submittedForm.find(productFormBtnSelector).prop('disabled',false).removeClass(theme.classes.processing);
        }
        if ($itemsContainer.attr("data-cart-page") == "true") {
          //Do no open mini basket if on cart page
        } else {
          // Hide promo popups when cart is opening
          $("[data-promo-overlay]").removeClass("promo-popup__overlay--show");
        }

        if ($("[data-gift-item-nav]").length){
          var activeGift = $("[data-gift-active]");
          var targetIndex = $("[data-gift-item-nav]").find("[data-gift-item-target]").index(activeGift);
          scrollToGiftItem(targetIndex);
        }

        //If bundle overlay exists
        if ($bundleOverlays.length) {
          //Hide Loading
          $("[data-overlay-buttons]").removeClass("hide");
          $("[data-overlay-loading]").removeClass("show");
          //Hide Overlay
          $("[data-collection-item-overlay]").removeClass("show");
        }

      }).fail(function(xhr,textStatus) { // if fail
        handleMiniBasketError('Failed to retrieve mini-basket',textStatus,xhr);
      });

    };


  };

  return {
    init: init
  }

})();