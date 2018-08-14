theme.bundleItems = (function(){

  var init = function() {
    var $items = $('[data-quick-buy-item]');
    if (!$items.length) { return; } // quit if not needed


    $items.each(function() {
      var $item = $(this),
      $productOverlayButtons = $item.find("[data-overlay-button]"),
      $productOverlayButtonContainer = $item.find("[data-overlay-buttons]"),
      $mainItem = $item.find("[data-bundle-main-item]"),
      $mainItemId = $mainItem.find("[name='id']"),
      $variantSelect = $item.find("[data-product-select]"),
      $messageOverlay = $item.find("[data-collection-item-overlay]"),
      $groupId = $item.find("[data-product-group-id]"),
      randomGroupId = generateGroupId(8),
      $mainProductForm = $item.find("[data-main-product-form]"),
      $bundleItems = $item.find("[data-bundle-item]"),
      $overlayLoading = $item.find("[data-overlay-loading]");

      //Set the group ID for each product
      $groupId.val(randomGroupId);

      $productOverlayButtons.on('click', function(e) {
        var addEmbroidery = $(this).attr("data-add-embroidery-logo");
        if (addEmbroidery == "true"){

          //Show Loading
          $productOverlayButtonContainer.addClass("hide");
          $overlayLoading.addClass("show");
          addBundleItems();
        } else {
          //If not bundling items, then fire function as normal (add mini basket attributes to fire normal function?)
          $mainProductForm.attr("data-mini-basket-product-form", "");
          $mainProductForm.attr("data-quick-buy-form", "");
          $mainProductForm.removeAttr("data-bundle-quick-buy-form");
          $mainProductForm.trigger('submit');

          //Hide Overlay
          $messageOverlay.removeClass("show");
        }
      });

      //Trigger change for hidden variant select
      $item.find("[data-quick-buy-size]").on("change", function(){
        $("[data-product-select]").trigger("change");
        randomGroupId = generateGroupId(8);
        //Set the group ID for each product
        $groupId.val(randomGroupId);
      });

      //Update variant ID when user selects new variant
      $variantSelect.on("change", function(){
        var newVariant = $(this).val();
        $mainItemId.val(newVariant);
      });

      function generateGroupId(length) {
        var result = "";
        var alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++) {
          result += alphaNum.charAt(Math.floor(Math.random() * alphaNum.length));
        }
        return result;
      }

      function push_to_queue(queueArray, obj) {
        queueArray.push(obj);
      }

      function addBundleItems(){
        Shopify.queue = [];

        $bundleItems.each(function(){
          var obj = {};
          $(this).children().each(function(){
            var key = $(this).attr("name"),
            value = $(this).val();
            obj[key] = value;
          });
          //build json here, pass through push_to_queue
          push_to_queue(Shopify.queue, obj);
        });
        bundleMoveAlong();
      }

      function bundleMoveAlong() {
        // If we still have requests in the queue, let's process the next one.
        if (Shopify.queue.length) {
          var request = Shopify.queue.shift();
          // pass the properties into addItem as well
          Shopify.addItemBundle(request, bundleMoveAlong);
        }
        // If the queue is empty, we are done adding items.
        else {
          //When done, update cart data
          theme.miniBasket.updateCartData();
          // //Hide Loading
          // $productOverlayButtonContainer.removeClass("hide");
          // $overlayLoading.removeClass("show");
          // //Hide Overlay
          // $messageOverlay.removeClass("show");

        }
      };

      Shopify.addItemBundle = function(dataObject, callback) {
        var params = dataObject;
        $.ajax({
          type: 'POST',
          url: '/cart/add.js',
          dataType: 'json',
          data: params,
          success: function(){
            callback();
          },
          error: function(XMLHttpRequest, textStatus) {
            console.log("error!");
            //Hide Loading
            $productOverlayButtonContainer.removeClass("hide");
            $overlayLoading.removeClass("show");
            //Hide Overlay
            $messageOverlay.removeClass("show");
          }
        });
      };

    });

  };

  return {
    init: init
  }
})();
