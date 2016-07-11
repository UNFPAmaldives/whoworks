$(function(){
    var ie = $('body').hasClass('d3-ie');

    // D3 extensions to move things to the front and back 
    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    d3.selection.prototype.moveToBack = function() { 
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        }); 
    };

    var Drones = {},
        bandPos = {},
        uniques = {};

    var bands = ['mishapcountry', 'ownerservice', 'ownerservicedupe', 'dronename'];
    var bandAttributes = {
        'mishapcountry' :   {
            label: 'What happened',
            labelPct: '0%',
            labelPos: 'topPos',
            dropdownPct: '2.5%',
            height: 35,
            sort_by : 'ownerservice',
            sort_order : function sort(a, b){
                return ((a.ownerservice < b.ownerservice) ? -1 : 1);
                return 0;        
            }
        },
        'ownerservice' :    {
            label : 'Who is the victim',
            labelPct: '41%',
            labelPos: 'topPos',
            dropdownPct: '39%',
            height: 15,
            sort_by : 'mishapcountry',
            sort_order : function sort(a, b){
                return ((a.mishapcountry < b.mishapcountry) ? -1 : 1);
                return 0;        
            }
        },
        'ownerservicedupe' : {
            height: 15,
            sort_by : 'dronename',
            sort_order : function sort(a, b){
                return ((a.dronename < b.dronename) ? -1 : 1);
                return 0;        
            }
        },
        'dronename' :       {
            label: 'Who did it',
            labelPct: '10%',
            dropdownPct: '16%',
            labelPos: 'bottomPos',
            height: 35,
            sort_by : 'ownerservice',
            sort_order : function sort(a, b){
                return ((a.ownerservice < b.ownerservice) ? -1 : 1);
                return 0;        
            }
        }
    }

    var mapOptions = {},
        vizOptions = {};

    function init(){
        ich.grabTemplates();
        if (!ie){
            $.drawWorld($('#map').width(), d3.select("#map"));
            getData(Drones);
            addEventListeners();
        }
    }
    function getData(obj){
        // SimpleTable.init( {
        //     key: '1-VfIjXSdI12kaTQgw_Vt0mJhNHoJJgOx1BdVqdKpjgQ',
        //     id: '1',
        //     cached: true,
        //     callback: function(d){
        //         console.debug(d)
        //         formatData(d, Drones)
        //     }
        // });

        d3.csv('data/drones__latest.csv', function(d) {
            console.debug(d)
            formatData(d, Drones)
        })
    }
    function formatData(d, store){
        // save it all down just in case
        store.raw = d;

        drawSvg(store);

        var year_data = groupData(d, 'mishapyear', null, sortByYear, sortByService);
        console.debug(year_data)
        drawYearTotals(year_data);

        var country_data = rollUpData(d, 'mishapcountry');
        highlightCountries(country_data);
    }
    function drawYearTotals(d){
        var columnWidth = calculateUnitWidth($('#drones-when'), d.length) + '%';
        $.each(d, function(k, year){
            var meta = $.extend({}, year, {
                column_width: columnWidth,
                mishap_count: year.values.length,
                key_abbrev: apostrophy(year.key, 2)
            });
            var new_column = drawIchTemplate('tm_column', meta)[0];
            $('#drones-when').find('.chart-wrapper').append(new_column);
            loopThroughMishaps(meta.values, $(new_column).find('.tm-mishap-wrapper'));
        });
        // drawAverage(Drones.raw.length, d.length, $('.tm-col').last().find('.tm-mishap').eq(14), $('#drones-when').find('.chart-wrapper'));
    }

    function drawAverage(t, c, point, container){
        var avg = t/c;
        var meta = {
            top_pos: '52.624242%',//point.position().top / container.outerHeight() * 100,
            average: avg.toFixed(0)
        }
        var average_line = drawIchTemplate('tm_average', meta)[0];
        container.prepend(average_line);
    }

    function loopThroughMishaps(values, wrapper){
        $.each(values, function(i, el){
            var meta = $.extend({}, el, {
                custom_classes: TWP.Util.slugify(el.ownerservice) + ' crash-id-' + el.crashid
            });
            var mishap_dot = drawIchTemplate('tm_dot', meta)[0];
            wrapper.append(mishap_dot);
        });
    }
    function drawIchTemplate(template, object){
        return ich[template](object);
    }    
    function drawSvg(obj){
        var data = obj.raw;


        var opts = getVizOptions(vizOptions, $('#drones-viz'));

        // create basic SVG container
        opts.svg_container = d3.select('#drones-viz').append('svg')
            .attr('id', 'drones-sankey')
            .attr('width', opts.chart_width + opts.margin.left + opts.margin.right)
            .attr('height', opts.chart_height + opts.margin.top + opts.margin.bottom)
        ;
        opts.svg_chart = opts.svg_container.append('g')
            .attr('class', 'svg-chart')
            .attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")")
        ;

        // based off of parallel coordinates example courtesy of bostock
        // http://mbostock.github.io/d3/talk/20111116/iris-parallel.html
        bands.forEach(function(type, index){
            // good lord...this can probably be written better.
            // --Emily Chow, 2014
            // YES IT COULD HAVE
            // --Laz, 2016
                      var grouped = groupData(data, type, bandAttributes[type].sort_by, 'descending', bandAttributes[type].sort_order);
                      var flatten_once = simplifyObjectToObject(grouped);
                      var sorted_data = sortAssociativeArrayByLength(flatten_once, 'values', 'desc');
                      
                      var flattened = simplifyObjectToArray(sorted_data);
                      Drones[type] = flattened;
                      bandPos[type] = {};

            // create filter menus
            // ignore ownerservicedupe (this could be done in a better way)
            if (index !== 2){
                createFilterMenu(type, rollUpData(data, type));
            }

            // mobile version will only include country counts;
            if (type === 'mishapcountry')
                drawMobileFallback(sorted_data);

            // defining d3 scales
            // defining x scale based on extra padding that needs to be factored in
            uniques[type] = flatten_once.map(function(d, i){ return d.key; });
            opts.totalPadding = opts.chart_width * 0.15,
            opts.xPadding[type] = opts.totalPadding / uniques[type].length;
            opts.xRange = d3.range(data.length + uniques[type].length);

            opts.xTransformation = d3.scale.ordinal()
                .domain(opts.xRange)
                .rangeRoundBands([0, opts.chart_width]);

            var uniqueType,
                labelMeta = {}
            ;
            opts.newPadding[type] = 0

            // draw actual svg elements
            var columnContainer = opts.svg_chart.append('svg:g')
                .attr('class', function(d, i){
                    return 'crash-wrapper type-' + type + '-' + index;
                })
                .attr('transform', function(d, i){
                    var yPos = type === 'ownerservice' ? opts.yTransformation(type) + 30 : opts.yTransformation(type);
                    return 'translate(0,' + yPos + ')';
                })
                .selectAll('rect.crash')
                    .data(flattened)
                .enter().append('rect')
                    .attr('class', function(d, i){
                        d.active_type = type;
                        return 'crash type-' + type + ' ' + formatClasses(d);
                    })
                    .attr('y', 0)
                    .attr('x', function(d, i){
                        // handling how to get the groupings to happen
                        if (d[type] !== uniqueType){
                            // store some new data
                            // for drawing the labels
                            labelMeta = {
                                count : 1,
                                slug : TWP.Util.slugify(d[type]),
                                typeLabel : d[type],
                                typeSlug : TWP.Util.slugify(type),
                                startId : d.crashid,
                                endId : d.crashid
                            };

                            uniqueType = d[type];
                            opts.newPadding[type] += opts.xPadding[type];
                        } else {
                            labelMeta.count++;
                            labelMeta.endId = d.crashid;
                        }
                        var itemPos =  opts.xTransformation.rangeBand() * i + opts.newPadding[type];
                        bandPos[type][d.crashid] = itemPos;

                        if ((i === flattened.length - 1 || d[type] !== flattened[i + 1][type]) && type !== 'ownerservicedupe'){
                            var start = labelMeta.startId,
                                end = labelMeta.endId,
                                startPos = bandPos[type][start],
                                endPos = bandPos[type][end];
                            labelMeta.leftPos = calculatePosition(opts.chart_width, startPos + opts.margin.left);
                            labelMeta.width = calculatePercentageWidth(opts.chart_width, startPos, endPos);
                            if (endPos - startPos < 40)
                                labelMeta.hideTitle = 'hide-label';

                            if (typeof bandAttributes[type].labelPos !== 'undefined')
                                labelMeta[bandAttributes[type].labelPos] = bandAttributes[type].labelPct;
                            
                            $('#drones-viz').append(ich.group_label(labelMeta));
                        }

                        return itemPos;
                    })
                    .attr('height', bandAttributes[type]['height'])
                    .attr('width', opts.xTransformation.rangeBand())
                    .on('mouseover', function(d){
                        showInfo('drones-viz', 'ich_tooltip', d)
                    })
                    .on('mouseout', function(d){hideInfo('drones-viz', d)})
                    .on('click', function(d){
                        trackClick('drone-click-line-chart', d.crashid);
                        showPanel($('.info-panel').find('.info-detail'), d)
                    })
                ;
            ;            
        });

        // creates lines
        opts.line = function(d) {
            var data_obj = ['M'];
            bands.map(function(p, i) {
                var yPos = i === 0 || i === 2 ? vizOptions.yTransformation(p) + bandAttributes[p]['height'] : i === 1 ? vizOptions.yTransformation(p) + 30 : vizOptions.yTransformation(p);
                data_obj.push([bandPos[p][d.crashid] + (vizOptions.xTransformation.rangeBand() * 0.5), yPos]);
                if (i !== 1 && i !== bands.length - 1){
                    data_obj.push('L');
                } else if (i !== bands.length - 1) {
                    data_obj.push('M');
                }
            });
            return data_obj.join('') + 'Z';
        };

        opts.connections = opts.svg_chart.append("svg:g")
            .attr("class", "connections")
        .selectAll("path")
            .data(data)
        .enter().append("svg:path")
            .attr("d", opts.line)
            .attr("class", function(d) {
                d.formatted_date = formatDatePostStyle(d.mishapdate);
                return 'crash-path ' + formatClasses(d)
            })
            .on('mouseover', function(d){
                showInfo('drones-viz', 'ich_tooltip', d)
            })
            .on('mouseout', function(d){hideInfo('drones-viz', d)})
            .on('click', function(d){ showPanel($('.info-panel').find('.info-detail'), d) })
        ;

        // if param exists
        // show that panel
        checkURL();
    }
    function resizeViz(svg_container, wrapper){
        bands.forEach(function(type, index){
            var opts = getVizOptions(vizOptions, wrapper);
            // repeat from drawSvg. oops.
            opts.totalPadding = opts.chart_width * 0.15,
            opts.xPadding[type] = opts.totalPadding / uniques[type].length;
            opts.xTransformation = d3.scale.ordinal()
                .domain(opts.xRange)
                .rangeRoundBands([0, opts.chart_width]);
            // need to update
            // svg chart transformation
            svg_container.style('width', opts.chart_width + 'px')
                    .style('height', opts.chart_height + 'px');
            // crash wrapper transformation
            // rectangle's x and width

            var uniqueType,
                labelMeta = {}
            ;
            opts.newPadding[type] = 0;
            svg_container.selectAll('.type-' + type + '-' + index).selectAll('.crash')
                .attr('x', function(d, i){
                    if (d[type] !== uniqueType){
                        // store some new data
                        // for drawing the labels
                        labelMeta = {
                            count : 1,
                            slug : TWP.Util.slugify(d[type]),
                            typeLabel : d[type],
                            typeSlug : TWP.Util.slugify(type),
                            startId : d.crashid,
                            endId : d.crashid
                        };

                        uniqueType = d[type];
                        opts.newPadding[type] += opts.xPadding[type];
                    } else {
                        labelMeta.count++;
                        labelMeta.endId = d.crashid;
                    }
                    var itemPos =  opts.xTransformation.rangeBand() * i + opts.newPadding[type];
                    bandPos[type][d.crashid] = itemPos;

                    if ((i === Drones[type].length - 1 || d[type] !== Drones[type][i + 1][type]) && type !== 'ownerservicedupe'){
                        labelMeta.leftPos = calculatePosition(opts.chart_width, bandPos[type][labelMeta.startId] + opts.margin.left);
                        labelMeta.width = calculatePercentageWidth(opts.chart_width, bandPos[type][labelMeta.startId], bandPos[type][labelMeta.endId]);
                        if (labelMeta.endId - labelMeta.startId < 35)
                            labelMeta.hideTitle = 'hide-label';

                        if (typeof bandAttributes[type].labelPos !== 'undefined')
                            labelMeta[bandAttributes[type].labelPos] = bandAttributes[type].labelPct;

                        updateLabelPos(labelMeta);                        
                        // $('#drones-viz').append(ich.group_label(labelMeta));
                    }
                    return itemPos;
                })
                .attr('width', opts.xTransformation.rangeBand());
        });
        svg_container.selectAll('.crash-path').attr('d', vizOptions.line);  
    }
    function updateLabelPos(opts){
        $('.label-wrapper.' + opts.slug).css({
            'left' : opts.leftPos
        });
    }
    function getVizOptions(opts, wrapper){
        /* svg "global" variables */
        opts.margin = { left: 0, right: 0, top: 40, bottom: 0 };
        opts.chart_width = wrapper.width() - opts.margin.left - opts.margin.right;
        opts.chart_height = wrapper.height() - opts.margin.top - opts.margin.bottom;
        opts.xPadding = {};
        opts.newPadding = {};

        // defining y scale which is for the whole svg
        // x scale is defined per "band" because of the grouping and padding that I want.
        // We'll see how this goes.
        opts.xTransformation;
        opts.yRange = [0, opts.chart_height];
        opts.yTransformation = d3.scale.ordinal()
            .domain(bands)
            .rangeBands(opts.yRange);

        return opts;
    }

    function checkURL(){
        var param = TWP.Util.getParameters(window.location.href).id;
        if (param) {
            var crash = Drones.raw[parseInt(param) - 1];
            if ($('.mobile-show').is(':visible')){
                selectInDropdown(TWP.Util.slugify(crash.mishapcountry));

                var $crash_item = $('.crash-incident[data-mishap="' + param + '"]');
                $crash_item.find('.row-info-wrapper').trigger('click');
                scrollObj($crash_item.offset().top, 50);
            } else {
                showPanel($('.info-panel').find('.info-detail'), crash);
            }
        }
    }
    function createFilterMenu(c, data){
        var meta = {
            type: c,
            category: bandAttributes[c]['label']
        };
        if (typeof bandAttributes[c].labelPos !== 'undefined')
            meta[bandAttributes[c].labelPos] = bandAttributes[c].dropdownPct;

        var menu = drawIchTemplate('select_menu', meta)[0];
        $('#filter-wrapper').append(menu);

        $.each(data, function(option, values){
            var option_meta = { name: option, slug: TWP.Util.slugify(option) };
            var item = drawIchTemplate('menu_option', option_meta)[0];
            $(menu).find('select').append(item);
        });

        if (c === 'mishapcountry')
            var $clone = $(menu).clone();
            $('.mobile-list').prepend($clone);
    }
    /* mobile version */
    function drawMobileFallback(data){
        Drones.countryKey = {};
        $.each(data, function(k, v){
            v.slug = TWP.Util.slugify(v.key);
            Drones.countryKey[v.slug] = v.values;
            var item = drawIchTemplate('country_group', v)[0];
            $('.mobile-chart').append(item);
            addUnits(v.values, $(item).find('.unit-wrapper'));
        });

        $('.mobile-list').on('change', 'select', function(){
            var value = $(this).val();
            var $list = $(this).closest('.mobile-list').find('.crash-list');
            $list.html('');
            drawRows(Drones.countryKey[value], $list);
        });

        var param = TWP.Util.getParameters(window.location.href).id;
        if (!param)
            selectInDropdown('united-states')
    }
    function selectInDropdown(val){
        $('.mobile-list').find('option[value="' + val + '"]').prop('selected', true);
        $('.mobile-list').find('select').trigger('change');        
    }
    function addUnits(array, container){
        $.each(array, function(i, unit){
            unit.custom_classes = TWP.Util.slugify(unit.ownerservice) + ' crash-id-' + unit.crashid + ' ' + TWP.Util.slugify(unit.mishapcountry) + ' ' + TWP.Util.slugify(unit.dronename);
            var item = drawIchTemplate('crash_square', unit)[0];
            container.append(item);
        });
    }
    function drawRows(array, container){
        array.sort(sortByDate);
        $.each(array, function(k, crash){
            // sort array by date (asc)
            // generate rows with all the info
            crash.mishapcountry_formatted = crash.mishapcountry === 'Classified' ? 'in a classified location' : crash.mishapcountry;
            crash.formatted_date = formatDatePostStyle(crash.mishapdate);
            var item = ich.crash_row(crash);
            container.append(item);
            if (crash.photo !== ''){
                getPhotos(item, crash);
            }
        });
    }
    // flattens an array of objects of objects into a single object    
    function simplifyObjectToObject(d){
        var flattened_obj = [];
        $.each(d, function(k, array){
            var new_obj = {
                key: k,
                values: []
            }
            flattened_obj.push(new_obj);
            $.each(array, function(i, el){
                $.each(el, function(j, o){
                    new_obj.values.push(o);
                });
            });
        });
        return flattened_obj;
    }
    // flattens an array of objects into a simple array    
    function simplifyObjectToArray(d){
        var flattened_array = [];
        $.each(d, function(k, array){
            $.each(array.values, function(i, el){
                flattened_array.push(el);
            });
        });
        return flattened_array;
    }
    // thanks mister nester and phoebe bright
    // learning how to use d3 nesting to format data
    function groupData(data, key_by, second_key, sort_direction, sort_values_by){
        if (second_key){
            var grouped_array = d3.nest()
                .key(function(d) { return d[key_by] }).sortKeys(d3[sort_direction])
                .sortValues(sort_values_by)
                .key(function(d) { return d[second_key] }).sortKeys(d3[sort_direction])
                .sortValues(sortByDate)                
                .map(data);            
        } else {
            var grouped_array = d3.nest()
                .key(function(d) { return d[key_by] }).sortKeys(d3[sort_direction])
                .sortValues(sort_values_by)
                .entries(data);
        }
        return grouped_array;
    }
    function rollUpData(data, type){
        var rollup = d3.nest()
          .key(function(d) { return d[type]; })
          .map(data);
        return rollup;
    }
    function sortByDate(a, b){
        var date_format = d3.time.format("%x");
        return ((date_format.parse(check_date(a, ' - ')) < date_format.parse(check_date(b, ' - '))) ? -1 : 1);
        return 0;
    }
    function sortByService(a, b){
        return ((a.ownerservice < b.ownerservice) ? -1 : 1);
        return 0;        
    }
    function sortByYear(a, b){
        return parseFloat(a) - parseFloat(b);
    }
    function sortAssociativeArrayByLength(obj, key, direction){
        var new_obj = obj.slice();
        new_obj.sort(function(a,b) {
            var aVal = a[key];
            var bVal = b[key];
            if (aVal.length === bVal.length) {
                return 0;
            } else {   
                return direction === 'desc' ? -(aVal.length - bVal.length) : aVal.length - bVal.length;
            }
        });
        return new_obj;
    }
    function check_date(data, delimiter){
        return data.mishapdate.indexOf(delimiter) > -1 ? '1/1/' + data.mishapdate.split(delimiter)[0] : data.mishapdate;
    }
    function filterViz(slugs){
        if (d3.selectAll('.' + slugs.join('.'))[0].length > 0){
            addClassed('.' + slugs.join('.'), 'filtered', 'has-filter');
            hideAlert();
        } else {
            removeClassed('.crash, .crash-path', 'filtered');
            showAlert();
        }
    }
    function returnToDefault(){
        removeClassed('.crash, .crash-path', 'filtered', 'has-filter');
        $('#filter-wrapper').find('option[value=""]').prop('selected', true);
        hideAlert();
    }
    function showAlert(){
        $('.no-results').show();
    }
    function hideAlert(){
        $('.no-results').hide();
    }
    function showPanel(container, o){
        o.mishapcountry_formatted = o.mishapcountry === 'Classified' ? 'in a classified location' : o.mishapcountry;
        var details = ich.drone_detail(o);
        container.attr('data-crash', o.crashid);
        container.html(details);
        if (o.photo !== ''){
            getPhotos(container, o);
        }
        handleSocial(o);
        addClassed('.crash-id-' + o.crashid, 'clicked', 'has-selection');
        highlightCircle(o.crashid);

        var $sankey = $(container).parent().prev(),
            sankey_bottom = $sankey.offset().top + $sankey.outerHeight();
        var window_viewport_bottom = $(window).height()/2 + $(window).scrollTop();
        if (window_viewport_bottom < sankey_bottom || !$(container).parent().is(':visible')){
            scrollObj(sankey_bottom, 50);
            $(container).parent().slideDown(300);            
        }
    }
    function getPhotos(container, o){
        var count = parseInt(o.photo, 10);
        var idx = 1;
        while (idx <= count){
            addPhoto(container, 'drone_' + o.crashid + '_' + idx.toString());
            idx++;
        }        
    }
    function addPhoto(container, image_slug){
        var img_meta = {
            img_src : image_slug
        };
        container.find('.img-wrapper').append(ich.drone_image(img_meta));
    }
    function hidePanel(obj){
        obj.slideUp(300);
        removeClassed('.crash.clicked, .crash-path.clicked', 'clicked', 'has-selection');
    }
    function showInfo(container_id, tooltip_template, o){
        $.showTooltip({
            wrapperId: container_id,
            data: o,
            contentFunction: function(d) {
                if (d.crashid)
                    highlightSelectItems(d.crashid);
                d.mishapcountry_formatted = d.mishapcountry === 'Classified' ? 'in a classified location' : d.mishapcountry;
                var tooltipHTML = ich[tooltip_template](d);
                return tooltipHTML;
            },
            xOffset: 0, // Optional: Defaults to 20
            yOffset: -20 //Optional: Defaults to 0
        });
    }
    function hideInfo(container_id, d){
        $.hideTooltip(container_id);
        removeHighlight(d.crashid);
    }
    function addClassed(item, class_name, container_class){
        // remove any from a previous highlight
        removeClassed('.' + class_name, class_name, container_class);
        // add class
        d3.select('svg#drones-sankey').classed(container_class, true);
        d3.selectAll(item).each(function(d){
            d3.select(this).classed(class_name, true)
            .moveToFront();
        });
    }
    function removeClassed(item, class_name, container_class){
        // remove any from a previous highlight
        if (container_class)
            d3.select('svg#drones-sankey').classed(container_class, false);
        d3.selectAll(item).each(function(d){
            d3.select(this).classed(class_name, false)
            .moveToBack();
        });
    }
    function highlightSelectItems(id){
        d3.select('svg#drones-sankey').classed('has-interaction', true);
        d3.selectAll('rect.crash-id-' + id + ', path.crash-id-' + id).each(function(d){
            d3.select(this).classed('highlighted', true)
            .moveToFront();
        });
    }
    function removeHighlight(id){
        d3.select('svg#drones-sankey').classed('has-interaction', false);
        d3.selectAll('rect.crash-id-' + id + ', path.crash-id-' + id).each(function(d){
            d3.select(this).classed('highlighted', false)
            .moveToBack();
        });
    }
    function highlightCircle(id){
        $('.tm-mishap.selected').removeClass('selected');
        $('.tm-mishap[data-mishap="' + id + '"]').addClass('selected');
    }
    function formatClasses(d){
        return TWP.Util.slugify(d['ownerservice']) + ' ' + TWP.Util.slugify(d['mishapcountry']) + ' ' + TWP.Util.slugify(d['dronename']) + ' crash-id-' + d['crashid'];
    }
    // changing year display for small screens from XXXX to 'XX
    function apostrophy(val, num){
        return '\'' + val.slice(2);
    }
    function getUniqueId(d){
        return formatDate(d.mishapdate, '-') + '_' + TWP.Util.slugify(d.mishapcountry) + '_' + d.drone_type;
    }
    function formatDate(date, new_delimiter){
        var new_date = new Date(date);
        return new_date.getFullYear() ? new_date.getFullYear() + '-' + (new_date.getMonth() + 1) + '-' + new_date.getDate() : 'unknown';
    }
    function formatDatePostStyle(date){
        var months_styled = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
        var is_classified = date.indexOf('-') > -1;
        var new_date = is_classified ? new Date(date.split(' - ')[0]) : new Date(date);
        return is_classified ? date
            : months_styled[new_date.getMonth()] + ', ' + new_date.getFullYear();
    }
    function calculateUnitWidth(obj, length){
        return (obj.outerWidth() / length) / obj.outerWidth() * 100;
    }
    function calculatePercentageWidth(container_length, start, end){
        var width = end - start,
            pct = width / container_length * 100,
            result = pct === 0 ? 1 : pct;
        return result.toString() + '%';
    }
    function calculatePosition(container_length, item_pos){
        return (item_pos / container_length * 100).toString() + '%';
    }

    /* draw world */
    function highlightCountries(d){
        $.each(d, function(country, obj){
            var slug = TWP.Util.slugify(country);
            var countries = d3.selectAll('#countries').selectAll('.' + slug)
                .classed('drone-location', true);

            if (!$('.mobile-list').is(':visible')){
                countries.on('mouseover', function(o){
                    var crashCount = d[o.id].length;
                    var tt_meta = {
                        country: o.id,
                        count: crashCount === 1 ? crashCount + ' crash' : crashCount + ' crashes'
                    }
                    showInfo('map', 'country_tooltip', tt_meta);
                })
                .on('mouseout', function(o){
                    var crashCount = d[o.id].length;
                    var tt_meta = {
                        country: o.id,
                        count: crashCount === 1 ? crashCount + ' crash' : crashCount + ' crashes'
                    }
                    hideInfo('map', tt_meta);
                });
            }
            countries.on('click', function(v, k){
                $('#filter-wrapper').find('option[value="'+slug+'"]').prop('selected', true);
                $('#filter-wrapper').find('select').trigger('change');
            });
        });
    }
    $.drawWorld = function(width, container){
        var opts = getMapOptions(mapOptions, width);
        var svg = container.append("svg")
            .attr("id", "svg-map")
            .attr("width", opts.w)
            .attr("height", opts.h);

        var countries = svg.append("svg:g")
            .attr("id", "countries");

        d3.json("data/topo-countries.json", function(error, world) {
            var collection = topojson.object(world, world.objects.countries);

            countries.selectAll("path")
                .data(collection.geometries)    // what do we want to draw
                .enter().append("svg:path")     // making svgs of them
                .attr("class", function(d){     // each path will have .country and .[country name]
                   return "country " + TWP.Util.slugify(d.id);
                })
                .attr("d", opts.path)
                ;               // defining path coordinates
        });
    }
    function resizeMap(svg_container, wrapper){
        var mapOpts = getMapOptions(mapOptions, wrapper.width());
        svg_container.style('width', mapOpts.w + 'px')
                .style('height', mapOpts.h + 'px');
        svg_container.selectAll('.country').attr('d', mapOpts.path);
    }
    function getMapOptions(opts, width){
        var h = width * 0.5;
        var proj = d3.geo.winkel3()
                .scale(width * 0.19)
                .translate([width / 2, (h/2)+(h/10)]);
        return {
            w : width,
            h : h,
            projection : proj,
            path : d3.geo.path().projection(proj)
        };
    }
    function getObj(id){
        var idx = id - 1,
            obj = Drones.raw[idx];
        return obj;      
    }
    function handleSocial(obj) {
        var rootUrl = window.location.href.indexOf('?') !== -1 ? window.location.href.split('?')[0] : window.location.href;
        getBitly(rootUrl, obj);
    }
    function getBitly(full_url, obj) {
        var new_url = encodeURIComponent(full_url + '?id=' + obj.crashid);
        jQuery.ajax({
            url: 'http://api.bitly.com/v3/shorten?access_token=201e4c823bfefe5fed35fdfe02ba5eb15da6c150&longUrl='+ new_url +'&format=json',
            dataType: 'jsonp',
            success: function(json) {
                //if we can, get the bit.ly url, otherwise just use the normal URL w/params
                if (json.status_txt == "OK") {
                    setBitly(json.data.url, full_url, obj);
                } else {
                    setBitly(new_url, full_url, obj);
                }
            },
            error: function(e) {
                setBitly(new_url, full_url, obj);
            }
        });
    }
    function setBitly(short_url, direct_url, obj) {
        var page_title = 'Drones crash database'; // $('meta[property="og:title"]').attr('content');
        obj.short_url = short_url;
        var share_custom = 'See details about the ' + obj.dronename + ' that crashed on ' + obj.formatted_date + '.';
        obj.share_text = page_title + ': ' + share_custom;
        var $share_container = !$('.mobile-list').is(':visible') ? $('.info-detail') : $('.crash-incident[data-mishap="' + obj.crashid + '"]');
        if ($share_container.find('.card-social').children().length < 1)
            $share_container.find('.card-social').append(ich.social_tools(obj));
    }
    function scrollObj(value, offset, callback){
        var scroll_offset = offset ? offset : 0;
        $('html, body').animate({
            scrollTop: value - scroll_offset
        }, 850, callback);
    }
    function trackClick(string, id){
        s.sendDataToOmniture(string, 'event80',
        {
            'prop19': string,
            'prop14' : 'panel_' + id,
            'eVar1' : s.eVar1,
            'eVar2' : s.eVar2,
            'eVar17' : s.eVar17
        });        
    }
    /* event listeners */
    function addEventListeners(){
        var $panel = $('.info-panel');
        $panel.on('click', '.close-btn', function(e){
            e.preventDefault();
            hidePanel($panel);
        });
        $panel.on('click', '.info-nav', function(e){
            e.preventDefault();
            var which = $(this).hasClass('info-prev') ? 'prev' : 'next';
            var current_id = parseInt($panel.find('.info-detail').attr('data-crash'), 10) - 1,
                new_id = $(this).hasClass('info-prev') && current_id === 0 ? Drones.raw.length - 1
                        : $(this).hasClass('info-next') && current_id === Drones.raw.length - 1? 0
                        : $(this).hasClass('info-prev') ? current_id - 1
                        : current_id + 1;

            // track event! 
            trackClick('drone-click-' + which, new_id);
            showPanel($panel.find('.info-detail'), Drones.raw[new_id]);
        });

        $('#filter-wrapper').on('change', 'select', function(){
            var selected = [];
            $.each($('#filter-wrapper').find('option:selected'), function(k, item){
                if ($(item).val() && $(item).val() !== '')
                    selected.push($(item).val());
            });
            if (selected.length > 0){
                filterViz(selected);
            } else {
                removeClassed('.crash, .crash-path', 'filtered', 'has-filter');
            }
        });

        $('#drones-when').on('mouseover', '.tm-mishap', function(){
            if (!$('.mobile-list').is(':visible')){
                var obj = getObj($(this).attr('data-mishap'));
                showInfo('drones-when', 'ich_tooltip', obj);
            }
        }).on('mouseout', '.tm-mishap', function(){
            if (!$('.mobile-list').is(':visible')){
                var obj = getObj($(this).attr('data-mishap'));
                hideInfo('drones-when', obj);
            }
        }).on('click', '.tm-mishap', function(){
            if (!$('.mobile-list').is(':visible')){
                var obj = getObj($(this).attr('data-mishap'));
                trackClick('drone-click-year-chart', $(this).attr('data-mishap'));
                showPanel($panel.find('.info-detail'), obj);                
            }
        });

        $('.clear-filter').on('click', function(e){
            e.preventDefault();
            returnToDefault();
        });

        $('.mobile-show').on('click', '.country-group', function(){
            var country = $(this).attr('data-country'),
                incidents = Drones.countryKey[country];
        });

        $('.mobile-show').on('click', '.crash-incident .row-info-wrapper', function(){
            var $incident = $(this).parent();
            if (!$incident.hasClass('selected'))
                handleSocial(Drones.raw[parseInt($incident.attr('data-mishap'), 10) - 1]);
            $incident.toggleClass('selected').siblings().removeClass('selected');
        });

        $('.clear-filter').on('click', function(e){
            e.preventDefault();
            returnToDefault();
        });

        $(document).keydown(function(e) {
            if ($panel.is(':visible')){
                // left
                if (e.which == 37) { $panel.find('.info-nav.info-prev').trigger('click'); }
                // right
                if (e.which == 39) { $panel.find('.info-nav.info-next').trigger('click'); }
                // esc
                if (e.which == 27){ $panel.find('.close-btn').trigger('click'); }
            }
        });

        $(window).on('resize', function(){
            resizeMap(d3.select("#svg-map"), $('#map'));
            resizeViz(d3.select("#drones-sankey"), $('#drones-viz'));
        });
    }

    init();
});