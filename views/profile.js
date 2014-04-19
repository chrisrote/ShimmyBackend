$('.editButton').click(function(){             
    var prod_id = $(this).data('productId')
    alert(prod_id);
});

$('.deleteButton').click(function(){             
    var prop_id = $(this).data('productId');
    console.log('prop_id: ' + prop_id);

    bootbox.dialog({
      message: "deleting property",
	  title: "Are you sure you want to delete this property?",
	  buttons: {
	    success: {
	      label: "Cancel",
	      className: "btn",
	      callback: function() {
	      }
	    },
	    danger: {
	      label: "Delete Property",
	      className: "btn-danger",
	      callback: function() {
	      	$.ajax({
	      		type: 'DELETE',
        		url: '/api/property/' + prop_id,
        		//data: { 'property_id' : prop_id },
        		dataType: "json",
        		cache: false,
        		timeout: 5000,
        		success: function(data) {
        			console.log('myProps BEFORE: ' + JSON.stringify(myProps));
        			myProps = data;
        			console.log('myProps AFTER: ' + JSON.stringify(myProps));
            		displayCallback.show("Property Successfully Deleted.");
        		}, 
        		error: function(jqXHR, textStatus, errorThrown) {
            		alert('error ' + textStatus + " " + errorThrown);
        		}
    		});
	      }
	    }
	  }
	});

    /*bootbox.confirm("Are you sure you want to delete this property?", function(result) {
    	console.log('result is: ' + result);
	}); */
});

