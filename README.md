# yearless-date.js

A yearless date picker plugin for the jQuery library.

![DatePicker](/doc/sample.png?raw=true)


### Getting started

Add yearless-date.min.js and jQuery 1.8 or higher to the page:
```html
<script src="https://code.jquery.com/jquery-1.11.2.min.js" type="text/javascript"></script>
<script src="js/yearless-date.min.js" type="text/javascript"></script>
```

Add yearless-date.min.css and (optionally) normalize.css to the page:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.2/normalize.min.css"></link>
<link rel="stylesheet" href="css/yearless-date.min.css"></link>
```

### Usage

Attach a yearless date picker to a text input:

```javascript
$('#my_text_input').YearlessDatepicker();
```

Customize the date picker:

```javascript
$('#my_text_input').YearlessDatepicker({
    on: {
        select: function(date) {
            alert("Date selected: " + date.toString("long"));
        },
        change: function(date) {
            // Triggered when you call setDate (see below) or select a date
        }
    },
    format: "short", // "long", "monthDay", "dayMonth"
    separator: "-", // Used for "monthDay" and "dayMonth" formats
    british: true, // Assume dates "01-02" are "dd-mm" rather than "mm-dd"
    css: {
        width: "250px" // Any CSS, this is applied to the container, so it's best
                       // not to set position to anything except "absolute"
    },
    display: {
        effect: "slide", // "expand", "fade"
        time: 200 // Duration
    },
    alt: {
        field: "alt_field_name", // id for hidden field for submitting form data --
                                 //    will be created if element with this id it doesn't exist
                                 //    and the name attribute is set to the id
                                 // Also accepts jQuery selection
        format: "long" // "short", "monthDay", "dayMonth", "json"
                       // If "json" is chosen the value is formatted as '{"m": 1, "d", 2}'
                       // i.e. in php:
                       //     json_decode($_POST['alt_field_name'], true) = array(
                       //                                                       m: 1,
                       //                                                       d: 2
                       //                                                   );
    },
    position: { // This works the same way as the jQuery UI my/at function
                // (NB jQuery UI is not a dependency for this)
        input: {
            v: "bottom", // "top", "center"
            h: "center" // "left", "right"
        },
        container: {
            v: "top",
            h: "center"
        }
    },
    date: [1, 6], //  Can be any format, e.g. "06 Jan", "06 January"
    min: [1, 2], //   When min and max are both set (and are different dates)
    max: [2, 20] //		only dates between min and max can be selected (works cyclically around the year)
});
```

Set a date:

```javascript
$('#my_text_input').YearlessDatepicker("setDate", "09 Jan");
```
			
Get a date:

```javascript
var date = $('#my_text_input').YearlessDatepicker("getDate");
alert(date.toString("long"));
```
			
Set the min / max:

```javascript
$('#my_text_input').YearlessDatepicker("setMin", "2 Jan");
$('#my_text_input').YearlessDatepicker("setMax", "13 Jan");
```
			
Add / remove events:

```javascript
$('#my_text_input').YearlessDatepicker("on", "select", false);
$('#my_text_input').YearlessDatepicker("on", "select", function(date){
	alert(date.toString("monthDay", "-"));
});
```
			
			
Destroy a datepicker:

```javascript
$('#my_text_input').YearlessDatepicker("destroy");
```


### Extras

This widget/plugin/ditty adds YearlessDate to the global namespace.  The date picker class is YearlessDate.Picker.  If you want access to the instance for a particular input, use:

 ```javascript
 $('#my_text_input').data("YearlessDatepicker");
 ```

 YearlessDate itself is the date class, you can use this to play with dates obtained from the picker, e.g.

```javascript
$('#my_text_input').YearlessDatepicker({
    date: "09 Jan"
});
var date = $('#my_text_input').YearlessDatepicker("getDate"), // 09 Jan
    anotherDate = date.clone(); // 09 Jan;

alert(date.compareTo(anotherDate) ? "The dates are different" : "The dates are the same");

anotherDate.shiftMonth(-1).shiftDay(1); // 10 Dec

alert(date.compareTo(anotherDate) < 0 ? anotherDate.toString("long") +
      " is later in the year" : "My code isn't working.");
```