
                                        // fetching and getting id names of span we gave to display error msg
                                        var firstNameError = document.getElementById("firstname-err");
                                        var lastNameError = document.getElementById("lastname-err");
                                        var emailError = document.getElementById("email-err");
                                        var phoneError= document.getElementById("phone-err");
                                        var passwordError = document.getElementById("password-err");
                                        var submitError = document.getElementById("submit-err");




                                        function validateFirstName(){
                                            var fname = document.getElementById("firstname").value;

                                            //can also use  if(fname.value=="")
                                            if(fname.length ==0){ 
                                            //to input and display on the page 'innerhtml' is used
                                                firstNameError.innerHTML ="<span style='color: #EA7884;'>first Name required</span>";
                                                return false;
                                            } 
                                            if(!fname.match(/(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/)){

                                                firstNameError.innerHTML = "<span style='color: #EA7884;'>Invalid firstName</span>";
                                                return false;
                                            }
                                            
                                            firstNameError.innerHTML = 'First Name' ;
                                            return true ;
                                            
                                        }

                                        function validateLastName(){
                                            var lname = document.getElementById("lastname").value;

                                            if(lname.length ==0){
                                                lastNameError.innerHTML ="<span style='color: #EA7884;'>LastName required</span>";
                                                return false;
                                            }
                                            if(!lname.match(/(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/)){

                                                lastNameError.innerHTML = "<span style='color: #EA7884;'>Invalid lastName</span>";
                                                return false;
                                            }
                                            
                                            lastNameError.innerHTML = 'Last Name' ;
                                            return true ;
                                            
                                        }

                                        function validateEmail(){
                                            var email = document.getElementById("email").value;
                                            if(email.length==0){
                                                emailError.innerHTML="<span style='color: #EA7884;'>Email required</span>"
                                                return false;
                                            }
                                            if(!email.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)){

                                                emailError.innerHTML = "<span style='color: #EA7884;'>Email invalid</span>";
                                                return false;

                                            }
                                            
                                                emailError.innerHTML="Email address";
                                            return true;
                                            
                                            
                                        }

                                        function validatePhone(){
                                            var phone=document.getElementById("phone").value;
                                            console.log('number being checked')
                                            if(phone.length == 0 ){
                                                phoneError.innerHTML = "<span style='color: #EA7884;'>Number required</span>";
                                                return false;
                                            }
                                            //  if(isNaN(phone)){
                                            //     phoneError.innerHTML = "please enter the digits";
                                            //     return false;
                                            // }
                                            //  if (phone.length < 10) {
                                            //     phoneError.innerHTML = "Minimum 10 characters";
                                            //     return false;
                                            // }
                                            //  if (phone.length > 10) {
                                            //     phoneError.innerHTML = "Maximum 10 characters";
                                            //     return false;
                                            // }
                                            if(!phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)){
                                                
                                                phoneError.innerHTML = "<span style='color: #EA7884;'>Number invalid format</span>";
                                                return false;
                                            }
                                            
                                                phoneError.innerHTML = '';
                                                return true;
                                            
                                        
                                        }

                                        function validatePassword(){
                                            var password = document.getElementById("password").value;
                                            if(password.length==0){
                                                passwordError.innerHTML="<span style='color: #EA7884;'>Password required</span>";
                                                return false;
                                            }
                                            if(!password.match(/^\d{4}$/)){

                                                passwordError.innerHTML = "<span style='color: #EA7884;'>Only 4 digit</span>";
                                                return false;

                                            }
                                            else{
                                                passwordError.innerHTML="Password";
                                                return true;
                                            }
                                            
                                        }

                                        /*this is like 'return true' at the end of the validation function,
                                        just like finalized output of the validate function ,
                                        this is finalised of all the other validations,
                                        may be thats why we return it*/
                                        function validateForm(){
                                            if(!validateFirstName() || !validateLastName() || !validateEmail() ||!validateNumber()|| !validatePassword() ){
                                            
                                                submitError.innerHTML = "<span style='color: #EA7884;'>Please fill up</span>";
                                                setTimeout(function(){submitError.style.display = 'none';} , 5000)
                                                return false;
                                            }

                                        }



