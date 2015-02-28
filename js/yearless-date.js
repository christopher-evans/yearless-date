(function($, window, document){

    "use strict";

    /*
    * Simple JavaScript Inheritance
    * By John Resig http://ejohn.org/
    * MIT Licensed.
    */
    var initializing = false,
        fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    window.Class = function(){  };

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for(var name in prop)
        {
            // Check if we're overwriting an existing function
            var test = typeof prop[name] === "function" &&
                typeof _super[name] === "function" &&
                fnTest.test(prop[name]);

            if(test)
            {
                prototype[name] = (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]);
            }
            else
            {
                prototype[name] = prop[name];
            }
        }

        // The dummy class constructor
        function Class()
        {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
            {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = window.Class.extend;

        return Class;
    };

    /**
     * Some utilities and information
     */
    var toString = Object.prototype.toString,
        isString = function(val) {
            return toString.call(val) === "[object String]";
        },
        isBoolean = function(val) {
            return toString.call(val) === "[object Boolean]";
        },
        isObject = function(val) {
            return toString.call(val) === "[object Object]";
        },
        isFunction = function(val) {
            return !!(val && val.constructor && val.call && val.apply);
        },
        isDefined = function(val) {
            return typeof val !== "undefined";
        },
        maxDaysInMonth = 31,
        monthsInYear = 12,
        daysInWeek = 7,
        monthMap = [
            null, // Months indexed from 1
            {
                s: "Jan",
                l: "January",
                d: 31
            },
            {
                s: "Feb",
                l: "February",
                d: 28
            },
            {
                s: "Mar",
                l: "March",
                d: 31
            },
            {
                s: "Apr",
                l: "April",
                d: 30
            },
            {
                s: "May",
                l: "May",
                d: 31
            },
            {
                s: "Jun",
                l: "June",
                d: 30
            },
            {
                s: "Jul",
                l: "July",
                d: 31
            },
            {
                s: "Aug",
                l: "August",
                d: 31
            },
            {
                s: "Sept",
                l: "September",
                d: 30
            },
            {
                s: "Oct",
                l: "October",
                d: 31
            },
            {
                s: "Nov",
                l: "November",
                d: 30
            },
            {
                s: "Dec",
                l: "December",
                d: 31
            }
        ],
        monthMapInv = {
            jan: 1,
            january: 1,
            feb: 2,
            february: 2,
            mar: 3,
            march: 3,
            apr: 4,
            april: 4,
            may: 5,
            jun: 6,
            june: 6,
            jul: 7,
            july: 7,
            aug: 8,
            august: 8,
            sep: 9,
            sept: 9,
            september: 9,
            oct: 10,
            october: 10,
            nov: 11,
            november: 11,
            dec: 12,
            december: 12
        },
        separators = [" ", "/", "-"]; // Allowable date separators

    /**
     * Yearless date object
     */
    window.YearlessDate = Class.extend({

        /**
         * Constructor for YearlessDate -- takes either a string ("01 March", "Mar 1") or an array
         * ([1,3], [3,1]) and a settings object
         *
         * @constructor
         * @public
         */
        init: function(  )
        {
            // Ensure default settings
            var settings = arguments[arguments.length-1];
            if (!isObject(settings)) {
                settings = {};
            }
            this.settings = $.extend({
                separator: "/",
                format: "long",
                british: true
            }, settings);

            // Parse arguments
            if (arguments.length < 1) {
                // No arguments -- error
                throw new Error("No arguments passed to YearlessDate");

            } else if (arguments.length < 2) {
                // One argument -- must be YearlessDate only
                   this.md = this._oneArgumentInit(arguments[0]);

            } else if (arguments.length < 3) {
                // Two arguments
                if (isObject(arguments[1])) {
                    // Second argument is settings object
                    this.md = this._oneArgumentInit(arguments[0]);
                } else {
                    // Second argument is numeric month
                    this.md = this._twoArgumentInit(arguments[0], arguments[1]);
                }

            } else {
                // Assume there are three arguments
                this.md = this._twoArgumentInit(arguments[0], arguments[1]);
            }
        },

        _oneArgumentInit: function()
        {
            if (isString(arguments[0])) {
                return this._parseStr(arguments[0]);
            } else if ($.isArray(arguments[0])) {
                return this._parseArr(arguments[0]);
            }
            throw new Error("Invalid argument: " + arguments[0]);
        },

        _twoArgumentInit: function(firstArg, secondArg)
        {
            var firstNum = parseInt(firstArg, 10),
                secondNum = parseInt(secondArg, 10);

            if (isNaN(firstNum) || isNaN(secondNum)) {
                throw new Error("Invalid arguments: " + firstArg + ", " + secondArg);
            }
            return [firstNum, secondNum];
        },

        _parseStr: function(str)
        {
            var arr,
                foundSeparator = false,
                monthFirst = false;

            // Split into array
            $.each(separators, function(i, separator){
                arr = str.split(separator);
                if (arr.length === 2) {
                    foundSeparator = true;
                    return false;
                }
            });

            if (!foundSeparator) {
                throw new Error("Invalid YearlessDate: " + str);
            }

            /* Parse month names */
            $.each([0, 1], function(i){
                var lowerCaseVal = arr[i].toLowerCase(),
                    m, d;

                if (isDefined(monthMapInv[lowerCaseVal])) {
                    arr[i] = monthMapInv[lowerCaseVal];
                    monthFirst = (i % 2) === 0;
                }
            });

            return this._parseArr(arr, monthFirst);
        },

        _parseArr: function(arr, monthFirst)
        {
            var monthFirst = isBoolean(monthFirst) ? monthFirst : this.settings.british,
                m = monthFirst ? arr[0] : arr[1],
                d = monthFirst ? arr[1] : arr[0];

            // Check for array
            if (!$.isArray(arr) || (arr.length < 2)) {
                throw new Error("Invalid argument: " + arr);
            }

            try {
                return this._parseMonthDay(m, d);
            }
            catch (err) {
                return this._parseMonthDay(d, m);
            }
        },

        _parseMonthDay: function(m, d)
        {
            var daysInMonth,
                m = parseInt(m, 10),
                d = parseInt(d, 10);

            // Check for integers and valid month
            if (isNaN(m) || isNaN(d) || !isDefined(monthMap[m])) {
                throw new Error("Invalid m, d: " + m + ", " + d);
            }

            // Check for valid day
            daysInMonth = monthMap[m].d;
            if ((d < 1) || (d > daysInMonth)) {
                throw new Error("Invalid day: " + d);
            }

            return [m, d];
        },

        compareTo: function(that)
        {
            if (this.md[0] > that.md[0]) {
                return 1;
            } else if (that.md[0] > this.md[0]) {
                return -1;
            } else if (this.md[1] > that.md[1]) {
                return 1;
            } else if (that.md[1] > this.md[1]) {
                return -1;
            }
            return 0;
        },

        isBetween: function(prev, next)
        {
            var prevComesFirst = prev.compareTo(next);

            if (prevComesFirst === 0) {
                // Whole year allowed
                return true;
            }
            if (prevComesFirst < 0) {
                // Previous before next
                return (prev.compareTo(this) <= 0) && (next.compareTo(this) >= 0);
            }
            // Previous after next
            return (prev.compareTo(this) <= 0) || (next.compareTo(this) >= 0);
        },

        toString: function(format, separator)
        {
            if (format === "short") {
                return this.md[1] + " " + monthMap[this.md[0]].s;
            }
            if (format === "long") {
                return this.md[1] + " " + monthMap[this.md[0]].l;
            }
            if (format === "json") {
                return JSON.stringify({
                    m: this.md[0],
                    d: this.md[1]
                });
            }
            if (!isString(separator)) {
                separator = this.settings.separator;
            }
            if (format === "monthDay") {
                return this.md.join(separator);
            }
            return this.md.reverse().join(separator);
        },

        getMonth: function(format)
        {
            var m = this.md[0];
            if (format === "short" || format === "long") {
                return YearlessDate.getMonthName(m, format);
            }
            if (format === "numeric") {
                return m;
            }
            return ( format ? "0" : "" ) + m;
        },

        getDay: function(format)
        {
            if (format === "numeric") {
                return this.md[1];
            }
            return ( format ? "0" : "" ) + this.md[1];
        },

        shiftMonth: function(num)
        {
            var newMonth = ( this.md[0] - 1 + parseInt(num, 10) ) % monthsInYear,
                daysInNewMonth;

            if (isNaN(newMonth)) {
                // Failed to parse month -- do nothing
                return this;
            }

            if (newMonth < 0) {
                // Account for the fact % doesn't map to [0, 11]
                newMonth += monthsInYear;
            }

            this.md[0] = newMonth + 1;
            daysInNewMonth = YearlessDate.getDaysInMonth(this.md[0]);
            if (this.md[1] > daysInNewMonth) {
                this.md[1] = daysInNewMonth;
            }
            return this;
        },

        shiftDay: function(num)
        {
            var daysInMonth = YearlessDate.getDaysInMonth(this.md[0]),
                toggleMonth = true;

            // Shift days
            this.md[1] += num;

            // Shift months as needed
            while (toggleMonth) {
                if (this.md[1] < 1) {
                    this.shiftMonth(-1);
                    daysInMonth = YearlessDate.getDaysInMonth(this.md[0]);
                    this.md[1] += daysInMonth;
                } else if (this.md[1] > daysInMonth) {
                    this.md[1] -= daysInMonth;
                    this.shiftMonth(1);
                    daysInMonth = YearlessDate.getDaysInMonth(this.md[0]);
                } else {
                    toggleMonth = false;
                }
            }

            return this;
        },

        setMonth: function(m)
        {
            var m = parseInt(m, 10),
                daysInMonth = YearlessDate.getDaysInMonth(m);

            if (daysInMonth === false) {
                return false;
            }

            if (this.md[1] > daysInMonth) {
                this.md[1] = daysInMonth;
            }

            return this.md[0] = m;
        },

        setDay: function(d)
        {
            var daysInMonth = YearlessDate.getDaysInMonth(this.md[0]),
                d = parseInt(d, 10);

            if (isNaN(d) || d < 1 || d > daysInMonth) {
                return false;
            }

            return this.md[1] = d;
        },

        clone: function()
        {
            return new YearlessDate(this.md[0], this.md[1], this.settings);
        }

    });

    $.extend(window.YearlessDate, {

        getDaysInMonth: function(m)
        {
            var monthData = monthMap[m];
            return isObject(monthData) ? monthData.d : false;
        },

        getMonthName: function(m, format)
        {
            var monthData = monthMap[m];

            if (!isString(format)) {
                format = "long";
            }

            return isObject(monthData) ? monthData[format.charAt(0)] : false;
        },

        monthLoop: function(callback)
        {
            $.each(monthMap, function(i, month){
                if (isObject(month)) {
                    callback(i, month);
                }
            });
        }

    });

    /***
     * Yearless datepicker object
     */

    var effectMap = {
            fade: {
                "in": "fadeIn",
                out: "fadeOut"
            },
            slide: {
                "in": "slideDown",
                out: "slideUp"
            },
            expand: {
                "in": "show",
                out: "hide"
            }
        };


    window.YearlessDate.Picker = Class.extend({

        init: function(input, settings)
        {
            // Set up input
            this.input = $(input);
            if (!this.input.length) {
                throw new Error("No input identified");
            }

            // Check if datepicker already exists for this input
            if (this.input.data("YearlessDatepicker") === "true") {
                return;
            }
            this.input.on("change", $.proxy(this.onInputChange, this))
                    .attr("readonly", true);

            // Initialize settings
            if (!isObject(settings)) {
                settings = {};
            }
            this.settings = $.extend(true, {
                format: "long",
                separator: "/",
                british: false,
                css: {
                    display: "none"
                },
                position: {
                    input: {
                        v: "bottom",
                        h: "left"
                    },
                    container: {
                        v: "top",
                        h: "left"
                    }
                },
                display: {
                    time: 200,
                    effect: "expand"
                },
                on: {
                    select: false,
                    change: false
                }
            }, settings);

            // Add picker to DOM
            this.container = $('<div></div>', {
                attr: {
                    "class": "ydatepicker-container radius__6"
                },
                css: this.settings.css
            }).appendTo('body');

            // Sort out date arguments
            var defaultDates = {
                    date: [1, 1],
                    min: false,
                    max: false
                };


            $.each(defaultDates, $.proxy( function(type, dateArr){
                var date = false,
                    str;

                // Check settings for value
                if (this.settings[type]) {
                    date = this._parseDate(this.settings[type]);
                }
                // If type is initial date, check input for valule
                if (!date && (type === "date")) {
                    str = this.input.val();
                    date = this._parseDate(str);
                }
                // Else use the default value, if there is one
                if (!date && dateArr) {
                    date = this._parseDate(dateArr);
                }
                // Set the value
                this.settings[type] = date;
            }, this ) );

            // Check date is between min and max
            if (this.settings.min && this.settings.max && !this.settings.date.isBetween(this.settings.min, this.settings.max)) {
                this.settings.max = false;
            }

            // Initialize selected & displayed date
            this.date = this.settings.date.clone();
            this.currentDate = this.date.clone();

            // Draw datepicker
            this.drawPicker();

            // Set up alt input
            if (isObject(this.settings.alt)) {
                this.setupAltField();
            }
        },

        destroy: function()
        {
            // Clean input
            this.input.attr("readonly", false)
                      .off("change");

            // Remove container from DOM
            this.container.remove();
        },

        drawPicker: function()
        {
            var monthName = this.date.getMonth("long"),
                arrSvg = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 100 100'>\
                              <path class='inner-shape' transform='{{transform-rotate}}' d='M98.797,45.427H19.864l22.75-21.321H28.832L1.203,50l27.629,25.893h13.782l-22.75-21.32h78.933V45.427z'></path>\
                          </svg>",
                html = "<div class='ydatepicker-head noselect'>\
                            <div class='ydatepicker-head__inner radius__6 gradient__light'>\
                                <a class='ydatepicker-head__left' data-shift='-1'>" + arrSvg.replace("{{transform-rotate}}", "") + "</a>\
                                <span class='ydatepicker-head__month'><strong>" + monthName + "</strong></span>\
                                <a class='ydatepicker-head__right' data-shift='1'>" + arrSvg.replace("{{transform-rotate}}", "rotate(-180, 50, 50)") + "</a>\
                            </div>\
                        </div>\
                        <div class='ydatepicker-body noselect'>\
                            <div class='ydatepicker-body__inner'>\
                                <table>\
                                    <tr>";

            for (var i = 1; i <= maxDaysInMonth; i++) {

                if ((i-1) && ((i - 1) % daysInWeek) < 1) {
                    // Need a new row
                    html += "</tr><tr>";
                }
                html += "<td data-day='" + i + "'><a class='gradient__dark'>" + i + "</a></td>";
            }

            html +=                 "</tr>\
                                </table>\
                            </div>\
                        </div>";

            this.container.html(html);

            this.setEvents();
            this.setInput();
        },

        setEvents: function()
        {
            // Month change
            this.container.find('.ydatepicker-head [data-shift]').on('click', $.proxy(this.onMonthShiftClick, this));

            // Month change arrow hover
            this.container.find('.ydatepicker-head__left svg,.ydatepicker-head__right svg').hover( $.proxy(function(e){
                $(e.target).closest('svg').find('path').attr('fill', 'darkgrey');
            }, this), $.proxy(function(e){
                $(e.target).closest('svg').find('path').attr('fill', 'black');
            }, this));

            // Day selection
            this.container.find('.ydatepicker-body td[data-day] a').on('click', $.proxy(this.onDaySelect, this));

            // Input click
            this.input.on('click', $.proxy( function(e){
                if (this.container.data("ydatepicker__open") !== "true") {
                    this.openPicker();
                }
                e.stopPropagation();
            }, this ) );

            // Click away
            $('body').on('click', $.proxy( this.closePicker, this));
            this.container.on('click', function(e){
                e.stopPropagation();
            });
        },

        closePicker: function()
        {
            var d = this.settings.display;

            // Close datepicker
            this.container[effectMap[d.effect].out](d.time); // Open
            this.container.data("ydatepicker__open", "false");
        },

        openPicker: function()
        {
            var d = this.settings.display;

            // Close other pickers on page
            $('.ydatepicker-container').data("ydatepicker__open", "false")
                                .hide();


            if (this.container.data("ydatepicker__open") !== "true") {

                // If not already open, reset date
                this.shiftMonth(this.date.getMonth("numeric") - this.currentDate.getMonth("numeric"));

                // Set up view
                this.setDisplay();

                // Set position
                this.position(this.settings.position);

                // Identify as open
                this.container.data("ydatepicker__open", "true");

                // Open
                this.container[effectMap[d.effect]["in"]]({
                    duration: d.time
                });
            }
        },

        onMonthShiftClick: function(e)
        {
            var shift = $(e.target).closest('[data-shift]').data("shift");
            this.shiftMonth(shift);
        },

        shiftMonth: function(num)
        {
            this.currentDate.shiftMonth(num);
            this.setDisplay();
        },

        setDisplay: function()
        {
            var daysInMonth = YearlessDate.getDaysInMonth(this.currentDate.getMonth("numeric")),
                dayTable = this.container.find('.ydatepicker-body table'),
                currentMonth = this.currentDate.getMonth(),
                table = this.container.find('table'),
                min = this.settings.min,
                max = this.settings.max,
                selectedTds;

            // Change month text
            this.container.find('.ydatepicker-head__month strong').html(this.currentDate.getMonth("long"));

            // Hide days not in month
            dayTable.find('td').show()
                    .removeClass("selected disabled");
            for (var day = daysInMonth + 1; day <= maxDaysInMonth; day++) {
                dayTable.find('td[data-day=' + day + ']').hide();
            }

            // Highlight selected date
            if (this.date.getMonth() == currentMonth) {
                dayTable.find('td[data-day=' + this.date.getDay() + ']').addClass("selected");
            }

            // Disabled ranges
            if (min && max) {

                // Empty jquery selection to add to
                selectedTds = $('initialize_empty_selection');

                // Min and max are set
                if ((min.getMonth() === currentMonth) && (max.getMonth() === currentMonth)) {
                    if (min.compareTo(max) <= 0) {
                        for (var i = 0; i < min.getDay("numeric"); ++i) {
                            selectedTds = selectedTds.add('td[data-day=' + i + ']', table);
                        }
                        for (var i = max.getDay("numeric") + 1; i <= daysInMonth; i++) {
                            selectedTds = selectedTds.add('td[data-day=' + i + ']', table);
                        }
                    } else {
                        for (var i = max.getDay("numeric") + 1; i < min.getDay(  ); i++) {
                            selectedTds = selectedTds.add('td[data-day=' + i + ']', table);
                        }
                    }
                }
                else if (min.getMonth() === currentMonth) {
                    for (var i = 0; i < min.getDay(); i++) {
                        selectedTds = selectedTds.add('td[data-day=' + i + ']', table);
                    }
                } else if (max.getMonth() === currentMonth) {
                    for (var i = max.getDay("numeric") + 1; i <= daysInMonth; ++i) {
                        selectedTds = selectedTds.add('td[data-day=' + i + ']', table);
                    }
                } else if (!this.currentDate.isBetween(min, max)) {
                    selectedTds = selectedTds.add('td[data-day]', table);
                }

                selectedTds.addClass("disabled");
            }
        },

        onDaySelect: function(e)
        {
            var dayEl = $(e.target).closest('[data-day]'),
                isDisabled = dayEl.hasClass("disabled");

            if (isDisabled) {
                return;
            }

            if (this.currentDate.setDay(dayEl.data("day"))) {
                // Set new date
                this.setDate(this.currentDate.clone());
                if (isFunction(this.settings.on.select)) {
                    try {
                        this.settings.on.select(this.date.clone(), true);
                    } catch(e) {  }
                }
            }
            this.closePicker();
        },

        setDate: function(date, dontCallChangeEvent)
        {
            date = this._parseDate(date);
            if (date) {
                this.date = date.clone();
                if (!dontCallChangeEvent && isFunction(this.settings.on.change)) {
                    try {
                        this.settings.on.change(this.date.clone());
                    } catch(e) {  }
                }
            }
            this.setInput();
            this.setAltField();
        },

        onInputChange: function(e)
        {
            var str = this.input.val();
            this.setDate(str);
        },

        setInput: function()
        {
            this.input.val( this.date.toString(this.settings.format, this.settings.separator) );
        },

        getDate: function()
        {
            return this.date.clone();
        },

        on: function(event, callback)
        {
            if (!isFunction(callback)) {
                callback = false;
            }
            if ($.inArray(event, ["change", "select"]) > -1) {
                this.settings.on[event] = callback;
            }

        },

        _parseDate: function(date)
        {
            if (!(date instanceof YearlessDate)) {
                try {
                    date = new YearlessDate(date);
                } catch(e) {
                    console.log(e);
                    date = false;
                }
            }
            return date;
        },

        setMin: function(date)
        {
            date = this._parseDate(date);
            if (date) {
                if (!this.settings.max || this.date.isBetween(date, this.settings.max)) {
                    this.settings.min = date;
                }
            }
        },

        setMax: function(date)
        {
            date = this._parseDate(date);
            if (date) {
                if (!this.settings.min || this.date.isBetween(this.settings.min, date)) {
                    this.settings.max = date;
                }
            }
        },

        position: function(position)
        {
            var container = this.container,
                input = this.input;

            // Move out of sight to measure dimensions
            container.offset({ left: -1000 })
                    .show();

            // Measure everything
            var inputOffset = input.offset(),
                map = {
                    top: 0,
                    center: 0.5,
                    bottom: 1,
                    left: 0,
                    right: 1
                };

            // Set offset and hide for animation
            container.offset({
                left: inputOffset.left + map[position.input.h] * input.outerWidth() - map[position.container.h] * container.outerWidth(),
                top: inputOffset.top + map[position.input.v] * input.outerHeight() - map[position.container.v] * container.outerHeight()
            }).hide();
        },

        setupAltField: function()
        {
            var settings = this.settings.alt,
                formats = ["json", "long", "short", "dayMonth", "monthDay"],
                el;

            if (!settings || ($.inArray(settings.format, formats) < 0)) {
                this.settings.alt = false;
                return;
            }

            if (isString(settings.field) && (settings.field.charAt(0) !== "#")) {
                settings.field = "#" + settings.field;
            }

            el = $(settings.field);
            if (el.length < 1) {
                el = $('<input></input>', {
                    attr: {
                        id: settings.field,
                        name: settings.field,
                        type: "hidden"
                    }
                });
                this.input.after(el);
            }

            this.settings.alt.el = el;

            this.setAltField();
        },

        setAltField: function()
        {
            var settings = this.settings.alt;
            if (settings && settings.el) {
                settings.el.val( this.getDate().toString(settings.format) );
            }

        }

    });

    /**
     * jQuery wrapper for yearless datepicker
     */

    var publicMethods = [
            "setDate", "getDate", "destroy", "on", "setMin", "setMax"
        ],
        publicName = "YearlessDatepicker";

    // jQuery it up
    $.fn.YearlessDatepicker = function(method)
    {
        var instance = this.data(publicName);

        if (method === "destroy") {
            instance[method].apply(instance, Array.prototype.slice.call(arguments, 1));
            this.data(publicName, false);
        } else if (instance && ($.inArray(method, publicMethods) > -1)) {
            return instance[method].apply(instance, Array.prototype.slice.call(arguments, 1));
        } else if (isObject(method) || !method) {
            if (!instance) {
                this.data(publicName, new YearlessDate.Picker(this, method));
            }
        } else {
            $.error("Method " + method + " does not exist for jQuery." + publicName);
        }
    };

})(jQuery, this, document);