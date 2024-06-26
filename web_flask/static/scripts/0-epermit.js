// Load this script on all pages
$(function () {
    const faqs = document.querySelectorAll(".faq");
    faqs.forEach(faq => {
        faq.addEventListener("click", () => {
            faq.classList.toggle("active");
        })
    })

    $('.nav-link').on('click', function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    // forgot password cancel
    $('.cancel-forgot').on('click', function (e) {
        e.preventDefault();
        window.location.href = "https://www.epermit.live/login";
    });

    // Alert timeouts
    setTimeout(function () {
        $('#flash-message, #flash-error-p').fadeOut('slow', function () {
            $(this).hide();
        });
    }, 8000);
    // ------------------------------------------------------------------------

    // Registering a business page
    // counts characters as user fills in register bs
    $('.form-control').on('input', function () {
        const ariaDescribedBy = $(this).attr('aria-describedby');
        const charCountElement = $('#' + ariaDescribedBy);
        const currentLength = $(this).val().length;
        charCountElement.text(`Entered: ${currentLength} characters.`);
    });

    // Adds light yellow on form focus fields
    $('.mb input, .mb textarea, .mb select').focus(function () {
        $(this).closest('.mb').addClass('focus-highlight');
    });
    $('.mb input, .mb textarea, .mb select').blur(function () {
        $(this).closest('.mb').removeClass('focus-highlight');
    });

    $('.latitude-dv, .longitude-dv').find('input').focus(function () {
        $(this).closest('.col').addClass('focus-highlight');
    });

    $('.latitude-dv, .longitude-dv').find('input').blur(function () {
        $(this).closest('.col').removeClass('focus-highlight');
    });
    $('#category').on('change', function () {
        let fee = $(this).find('option:selected').data('fee');
        let fire_fee = $(this).find('option:selected').data('fire_fee');

        let total_fee = parseFloat(fee) + parseFloat(fire_fee);
        $('.exp-bill').text(`Total fee: ${total_fee}`).css({
            'text-align':'center',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center'
        });

    });
    // submiting business details for registration
    $('.register-bs-btn').click(function (e) {
        e.preventDefault();

        $(this).text("Processing...");

        // if required fields are missing show error
        let isValid = true;
        $('.form-business, .form-owner').find(
            'input[required], textarea[required], select[required]').each(
            function(){
            if ($(this).val() == ''){
                isValid = false;
                $(this).addClass('is-invalid')
            } else{
                $(this).removeClass('is-invalid')
            }
        })

        // if missing fields return stop executing
        if (!isValid){
            showAlert('Please fill out all fields', 'error', 'flash-form-error')
            fadeOut('flash-msg')
            $('.register-bs-btn').text("Submit");
            return;
        }

        //check if declarition was checked before submitting to server
        if ($('.declaration').find('input').is(':checked')) {
            let business_registration_data = {}
            let owner_info = {}
            let rawBusinessFormData = $('.form-business').serializeArray();
            let rawOwnerFormData = $('.form-owner').serializeArray();

            // retrieve business info from form object to be sent to the server
            $.each(rawBusinessFormData, function (index, obj) {
                business_registration_data[obj.name] = obj.value;
            });

            // retrieve owner info from form object to be sent to server
            $.each(rawOwnerFormData, function (index, obj) {
                owner_info[obj.name] = obj.value;
            });

            if (!Number.isInteger(Number(business_registration_data['Certificate_of_Registration_No']))) {
                showAlert('Certificate_of_Registration_No must be an number', 'error', 'flash-form-error');
                fadeOut('flash-msg');
                return;
            }

            let ownerInfoSubmitted = false;
            let businessInfoSubmitted = false;
            // send business info to the server
            $.ajax({
                url: "https://www.epermit.live/api/v1/businesses",
                type: "POST",
                data: JSON.stringify(business_registration_data),
                contentType: "application/json",
                success: function (data) {
                    businessInfoSubmitted = true;
                    if (ownerInfoSubmitted) {
                        $('.register-bs-btn').text("Submit");
                        showAlert("Successfully submited!!", 'success', 'flash-form-error');
                        fadeOut('.flash-msg')
                        window.location.href = "https://www.epermit.live/mybusinesses";
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    showAlert('Something went wrong!', 'error', 'flash-form-error')
                    fadeOut('flash-msg')
                    $('.register-bs-btn').text("Submit");
                }
            });

            // // retrieve owner info from form object to be sent to the server
            let user_id = owner_info['owner']
            delete owner_info['owner'];

            // send owner info to the server
            $.ajax({
                url: "https://www.epermit.live/api/v1/users/" + user_id,
                type: "PUT",
                data: JSON.stringify(owner_info),
                contentType: "application/json",
                success: function (data) {
                    ownerInfoSubmitted = true;
                    if (businessInfoSubmitted) {
                        $('.register-bs-btn').text("Submit");
                        showAlert("Successfully submited!!", 'success', 'flash-form-error');
                        fadeOut('flash-msg')
                        window.location.href = "https://www.epermit.live/mybusinesses";
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    showAlert("Something went wrong!", 'error', 'flash-form-error');
                    fadeOut('flash-msg');
                    $('.register-bs-btn').text("Submit");
                }
            });
        } else {
            showAlert("Please accept the declaration to proceed.", 'error', 'flash-form-error');
            fadeOut('flash-msg');
            $('.register-bs-btn').text("Submit");
        }
    });


    // small screens js
    if ($(window).width() <= 768) {
        $('.menu').on('click', function () {
            let sideNav = $('.side-nav');
            if (sideNav.css('width') === '0px') {
                sideNav.css({
                    'width': '60%',
                    'transition': 'width 0.5s ease'
                });
            } else {
                sideNav.css({
                    'width': '0',
                    'transition': 'width 0.5s ease'
                });
            }
        });

        $(window).on('click', function (e) {
            // Check if the click is outside of the menu and the side-nav
            if (!$(e.target).closest('.menu').length && !$(e.target).closest('.side-nav').length) {
                $('.side-nav').css({
                    'width': '0',
                    'transition': 'width 0.5s ease'
                });
            }
        });
    }

    // Permit payement
    $('#pay-permit').on('click', function(e){
        e.preventDefault()
        let isValid = true;
        mpesaForm = $('#mpesa-form')
        errorMsgDiv = $('.error-p-f')

        mpesaForm.find('input[required], select[required]').each(
                function () {
                    if ($(this).val() == '') {
                        isValid = false;
                        $(this).addClass('is-invalid')
                    } else {
                        $(this).removeClass('is-invalid')
                    }
                })

        // if missing fields return stop executing
        if (!isValid) {
            showAlert('Please fill out all fields', 'error', 'flash-error-p')
            fadeOut('error-p-f')
            $('.register-bs-btn').text("Submit");
            return;
        }

        let businessDataReqPermit = {}
        let mpesaFormRawData = mpesaForm.serializeArray();

        // retrieve business info from form object to be sent to the server
        $.each(mpesaFormRawData, function (index, obj) {
            businessDataReqPermit[obj.name] = obj.value;
        });
        console.log(businessDataReqPermit)

        console.log(businessDataReqPermit['business_id']);
        stkPush(businessDataReqPermit, function(result) {
            if (result === 0) {
                    $.ajax({
                        url: 'https://www.epermit.live/api/v1/devcallback/' + businessDataReqPermit['business_id'],
                        type: 'GET',
                        success: function(data) {
                            console.log(data);
                            getPermit(businessDataReqPermit['business_id']);
                            window.location.href = 'https://www.epermit.live/dashboard';
                        },
                        error: function(data) {
                            console.log(data);
                            console.log('Error getting permit');
                        }
                    });
                } else {
                console.log('Payment failed');
                }
        });
    })

    // permit download
    $('.download-permit-btn').on('click', function(){
        showAlert('Your request is being processed, Kinldy wait', 'success', 'flash-error-p')
        fadeOut('error-p-f', 80000);
        let business_id = $('#permitInput').val()
        console.log(business_id)
        getPermit(business_id)
    });
});

// -------------------------------- End of document ready -------------------------------------------

// This function fades out an element after a given time.
function fadeOut(className, timeInSec=8000) {
    setTimeout(function () {
        $('.' + className).fadeOut('slow', function () {
            $(this).hide();
            if ($(this).hasClass('error')) {
                $(this).removeClass('error');
            }else if ($(this).hasClass('success')) {
                $(this).removeClass('success');
            }
            $(this).text('');
        });
    }, timeInSec);
}

// This function shows an alert message
function showAlert(message, type, id) {
    $('#' + id).addClass(type).text(message).css({ 'padding-top': '18px' }).show();
}


// Function to show the waiting modal
function showWaitingModal() {
    $('#waitingModal').show();
}

// Function to hide the waiting modal
function hideWaitingModal() {
    $('#waitingModal').hide();
}

// STK push
function stkPush(businessDataReqPermit, callback) {
    $.ajax({
        url: 'https://www.epermit.live/api/v1/paympesa',
        type: 'POST',
        data: JSON.stringify(businessDataReqPermit),
        contentType: "application/json",
        success: function(data) {
            showAlert('Payment request sent, Please check your phone.', 'success', 'flash-error-p');
            fadeOut('error-p-f', 8000);
            showWaitingModal();
            // Give client 15sec before checking payment status
            setTimeout(function() {
                stkQuery(callback); // Call stkQuery with the callback
            }, 15000);
        },
        error: function(data) {
            console.error('Error sending STK push request.');
            showAlert('An error occurred. Please try again.', 'error', 'flash-error-p');
            hideWaitingModal();
            callback(1); // Return 1 indicating error
        }
    });
}

// stk query
function stkQuery(callback) {
    $.ajax({
        url: 'https://www.epermit.live/api/v1/stkquery',
        type: 'GET',
        success: function(data) {
            errorCode = data['errorCode'];
            if (errorCode) {
                showAlert('An error occurred while processing. Please try again later.', 'error', 'flash-error-p');
                fadeOut('error-p-f');
                hideWaitingModal();
                callback(1); // Return 1 indicating error
            } else {
                console.log(data);
                const resultCode = data['ResultCode'];
                console.log(resultCode);
                handlePaymentStatus(resultCode, callback); // Call handlePaymentStatus with the callback
            }
        },
        error: function() {
            console.log('Error querying payment status.');
            hideWaitingModal();
            callback(1); // Return 1 indicating error
        }
    });
}

// This function handles the payment status
function handlePaymentStatus(resultCode, callback) {
    if (resultCode === '0') {
        showAlert('Payment was successful!', 'success', 'flash-error-p');
        fadeOut('error-p-f');
        showAlert('Congratulations! An email will be sent with an attachemnt of permit in the next 10 minutes', 'success', 'flash-error-p');
        fadeOut('error-p-f', 10000);
        callback(0); // Return 0 indicating success
    } else if (resultCode === '1032') {
        showAlert('The payment request was canceled.', 'error', 'flash-error-p');
        fadeOut('error-p-f');
        hideWaitingModal();
        callback(1032); // Return 1032 indicating cancellation
    } else {
        showAlert('An error occurred while processing payment. Please try again later.', 'error', 'flash-error-p');
        fadeOut('error-p-f');
        hideWaitingModal();
        callback(1); // Return 1 indicating other error
    }
}

// This functions gets permit
function getPermit(business_id) {
    console.log(business_id)
    $.ajax({
        url: 'https://www.epermit.live/api/v1/generatepermit/'+ business_id,
        type: 'GET',
        xhrFields: {
            // Ensures the response is treated as a blob
            responseType: 'blob'
        },
        success: function (res) {
            showAlert('Download was successfull!', 'success', 'flash-error-p')
            fadeOut('error-p-f')

            let pdf = new Blob([res], { type: 'application/pdf' })
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(pdf);
            link.download = "ePermit.pdf";
            document.body.appendChild(link);

            // Trigger the download
            link.click();

            // Cleanup
            document.body.removeChild(link);
        },
        error: function () {
            showAlert('Downlaod failed, please try again', 'error', 'flash-error-p')
            fadeOut('error-p-f', 10000)
        }
    });
}