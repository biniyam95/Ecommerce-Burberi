
//add to cart is called in three places , instead of calling inside cart, wishlist, and singleProduct html , when we use a common js file , its like a common script , i dont 
//have to define it in all those html

//addtocart
function addToCartFun(productId){
  console.log(productId,'dfjdsfdsjfjd')
    
		$.ajax({
      url:'/add-to-cart/'+productId,
      method:'get',
      success:(response)=>{
					Swal.fire({
					position: 'top-end',
					icon: 'success',
					title: 'Product added to Cart',
					showConfirmButton: false,
					timer: 500
				})
       window.setTimeout(function(){
         location.reload()
        } ,600);
      }
  })  
};


function razorpayPayment(order) {
 console.log(order)
  var options = {
      "key": "rzp_test_uIof3eZN0qFU3a", // Enter the Key ID generated from the Dashboard
      "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      "currency": "INR",
      "name": "MiSty",
      "description": "Test Transaction",
      "image": "https://example.com/your_logo",
      "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      
      "handler": function (response) {
       //alerts to display payment id,order id, and signature
        /* alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature); */
      
        // to verifyPayment success or fail
        verifyPayment(response,order)// below ajax verifyPayment function is called by this

      },
      
      "prefill": {
          "name": "Gaurav Kumar",
          "email": "gaurav.kumar@example.com",
          "contact": "9999999999"
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#246165"
      }
  };
  //this is to render razorpay option
  var rzp1 = new Razorpay(options);
  rzp1.open();
};

//verifyPayment of razorpay
function verifyPayment(payment,order){
  $.ajax({
    url:'/verify-payment-razor',
    data:{
      payment:payment,
      order :order
    },
    method:'post',
    success:(response)=>{
      if(response.status){
        location.href="/order-success" // order-success page
      }
      else{
        location.href="/pay-fail"
         alert('payment failed')
      }
    }
  })

};







