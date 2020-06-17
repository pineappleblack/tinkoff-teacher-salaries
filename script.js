function define_styles() {
    if (window.innerWidth < 600) {
        mobile = true
        nomalFontSize = 12
        offset = 10
        offset_xlabel = 20
        rect_legend_size = 10
    }
    else {
        mobile = false
        nomalFontSize = 15
        offset = 20
        offset_xlabel = 30
        rect_legend_size = 20
    }
}

function build_graph() {
    // Размеры графика
    height = 300

    // Создание канваса
    if (window.innerWidth > 300) 
        total_width = window.innerWidth * 0.97
    else
        total_width = 300

    var svg = d3.select("#graph")
        .append("svg")
        .attr("class", "canvas")
        .attr("height", height + 1/6 * height + offset_xlabel)
        .attr("width", total_width)
        .append("g")

    // Определение тултипа
    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    // Чтение данных
    d3.csv("https://raw.githubusercontent.com/pineappleblack/tinkoff-fines/master/fines_data.csv", function(data) {

    // Сортировка
    data = data.slice().sort((a, b) => d3.ascending(parseFloat(a.law_number), parseFloat(b.law_number))
    || d3.descending(a.punishment_order, b.punishment_order))

    var punishments = []
    var laws = []

    data.forEach(function(d) {
    if (!punishments.includes(d.punishment)) {
        punishments.push(d.punishment)
    }

    if (!laws.includes(d.law)) {
        laws.push(d.law)
    }
    })

    // Ось Y:
    var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(punishments)
    .padding(0.01);

    // Подпись осей с наказаниями
    punishments_legend = svg
        .append("g") 
        .attr("class", "punish_text")
        .attr("transform",
        "translate(0, " + offset_xlabel + ")")

    punishments_text1 = punishments_legend
        .append("text")
        .attr("fill", "#999999")
        .attr("y", y(punishments[4]) + y.bandwidth() / 2)
        .style("font-size", nomalFontSize +"px")

    punishments_text1
        .append("tspan")
        .text("Штраф")

    punishments_text2 = punishments_legend
        .append("text")
        .attr("fill", "#999999")
        .attr("y", y(punishments[3]) + y.bandwidth() / 2)
        .style("font-size", nomalFontSize +"px")

    punishments_text2
        .append("tspan")
        .text("Приостановление")

    punishments_text2
        .append("tspan")
        .text("деятельности")
        .attr("x", 0)
        .attr("dy", "1.2em")

    punishments_text3 = punishments_legend
        .append("text")
        .attr("fill", "#999999")
        .attr("y", y(punishments[2]) + y.bandwidth() / 2)
        .style("font-size", nomalFontSize +"px")

    punishments_text3
        .append("tspan")
        .text("Дисквалификация")

    punishments_text3
        .append("tspan")
        .text("или лишение спец. права")
        .attr("x", 0)
        .attr("dy", "1.2em")

    punishments_text4 = punishments_legend
        .append("text")
        .attr("fill", "#999999")
        .attr("y", y(punishments[1]) + y.bandwidth() / 2)
        .style("font-size", nomalFontSize +"px")

    punishments_text4
        .append("tspan")
        .text("Конфискация")

    punishments_text5 = punishments_legend
        .append("text")
        .attr("fill", "#999999")
        .attr("y", y(punishments[0]) + y.bandwidth() / 2)
        .style("font-size", nomalFontSize +"px")

    punishments_text5
        .append("tspan")
        .text("Адм. арест")

    punishments_text5
        .append("tspan")
        .text("или обяз. работы")
        .attr("x", 0)
        .attr("dy", "1.2em")

    // Цветовая палитра
    var myColor = d3.scaleLinear()
    .range(["#f1e9da", "#CBAB76"])
    .domain([1,100])

    // Цветовая легенда
    color_legend = svg
    .append("g")

    percentile = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

    color_legend
        .selectAll()
        .data(percentile)
        .enter()
        .append("rect")
        .attr("y", function(d) { return d * height/110  })
        .attr("width", rect_legend_size )
        .attr("height", height/11 )
        .style("fill", function(d) { return myColor(d) } )

    color_legend
        .selectAll()
        .data(percentile)
        .enter() 
        .append("text")
        .attr("x", rect_legend_size * 1.5)
        .attr("y", function(d) { return d * height/110})
        .attr("dy", "1.5em")
        .attr("fill", "#999999")
        .text(function(d) { return d.toString() + "%" })
        .style("font-size", nomalFontSize +"px")

    // Сам график
    width = (total_width - punishments_legend.node().getBoundingClientRect().width - color_legend.node().getBoundingClientRect().width - 3*offset) 

    // Ось X:
    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(laws)
    .padding(0.01);

    graph = svg
        .append("g")
        .attr("transform",
            "translate(" + (punishments_legend.node().getBoundingClientRect().width + offset) + ", 0)")

    graph
        .selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.law) })
        .attr("y", function(d) { return y(d.punishment) + offset_xlabel})
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { if (d.punished_percent > 0) return myColor(d.punished_percent * 100); else return "#fff" } )
        .style("opacity", function(d) { if (d.punished_percent > 0) return 1; else return 0 } )
        .on("mouseover", function(d) {	
            if (d.punished_percent > 0) {
                div_width = div.node().getBoundingClientRect().width
                
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);
                law_text = d.law.split(" ");	

                if (law_text.length > 10) {
                    law_text = law_text.slice(0, 10);
                    law_text[law_text.length - 1] += "..."
                }

                law_text = law_text.join(' ')

                div	.html("<b>" + law_text + "</b><br><br>" + d.punishment + " — "
                 + (d.punished_percent * 100).toFixed(2)+"% " + "от общего числа наказанных по статье в 2019 году")
                
                div_height = div.node().getBoundingClientRect().height
                div
                    .style("left", (d3.event.pageX - div_width) + "px")		
                    .style("top", (d3.event.pageY - div_height) + "px");
                
                d3.select(this)
                    .transition()
                    .style("fill", "#7696cb");	
            }
        })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
            
            d3.select(this)
                .transition()
                .style('fill', function(d) { if (d.punished_percent > 0) return myColor(d.punished_percent * 100); else return "#fff" });
        });

    graph
        .append("text")
        .attr("dy", "1em")
        .attr("fill", "#999999")
        .text("Статьи КоАП")
        .style("font-size", nomalFontSize + "px")

    // Поставить ось с легендой
    color_legend
    .attr("transform",
        "translate(" + (punishments_legend.node().getBoundingClientRect().width + graph.node().getBoundingClientRect().width + 2 * offset) + ", " + offset_xlabel + ")")

    // Аннотации

    if (!mobile) {
        law1 = 'Статья 7.27. Мелкое хищение'
        law2 = 'Статья 8.17. Нарушение регламентирующих деятельность во внутренних морских водах, в территориальном море, на континентальном шельфе, в исключительной экономической зоне Российской Федерации или открытом море требований или условий лицензии'

        graph
            .append("line")
            .attr("x1", x(law1))  
            .attr("y1", 0 + offset_xlabel)
            .attr("x2", x(law1)) 
            .attr("y2", height + y.bandwidth() + offset_xlabel)
            .style("stroke-width", 1)
            .style("stroke", "#999999")

        graph
            .append("line")
            .attr("x1", x(law2))  
            .attr("y1", 0 + offset_xlabel)
            .attr("x2", x(law2)) 
            .attr("y2", height + offset_xlabel)
            .style("stroke-width", 1)
            .style("stroke", "#999999")

        label = graph
            .append("text")
            .attr("y", height + offset_xlabel)
            .attr("fill", "#999999")
            .style("font-size", nomalFontSize +"px")

        label
            .append("tspan")
            .text("Мелкое")
            .attr("x", x(law1))
            .attr("dx", "0.4em")
            .attr("dy", "1.2em")

        label
            .append("tspan")
            .text("хищение")
            .attr("x", x(law1))
            .attr("dx", "0.4em")
            .attr("dy", "1.2em")

        law1 = "Статья 16.1. Незаконное перемещение через таможенную границу Таможенного союза товаров и (или) транспортных средств международной перевозки"
        law2 = "Статья 17.7. Невыполнение законных требований прокурора, следователя, дознавателя или должностного лица, осуществляющего производство по делу об административном правонарушении"

        graph
            .append("line")
            .attr("x1", x(law1))  
            .attr("y1", 0 + offset_xlabel)
            .attr("x2", x(law1)) 
            .attr("y2", height + offset_xlabel)
            .style("stroke-width", 1)
            .style("stroke", "#999999")

        graph
            .append("line")
            .attr("x1", x(law2))  
            .attr("y1", 0 + offset_xlabel)
            .attr("x2", x(law2)) 
            .attr("y2", height - y.bandwidth() + offset_xlabel)
            .style("stroke-width", 1)
            .style("stroke", "#999999")

        label = graph
            .append("text")
            .attr("y", height - y.bandwidth() + offset_xlabel)
            .attr("fill", "#999999")
            .attr("dy", "1.2em")
            .style("font-size", nomalFontSize +"px")

        label
            .append("tspan")
            .text("Нарушение")
            .attr("x", x(law1))
            .attr("dx", "0.4em")

        label
            .append("tspan")
            .text("таможенных")
            .attr("x", x(law1))
            .attr("dx", "0.4em")
            .attr("dy", "1.2em")

        label
            .append("tspan")
            .text("правил")
            .attr("x", x(law1))
            .attr("dx", "0.4em")
            .attr("dy", "1.2em")
    } else {
        law1 = "Статья 16.1. Незаконное перемещение через таможенную границу Таможенного союза товаров и (или) транспортных средств международной перевозки"
        law2 = "Статья 17.7. Невыполнение законных требований прокурора, следователя, дознавателя или должностного лица, осуществляющего производство по делу об административном правонарушении"

        graph
            .append("line")
            .attr("x1", x(law1))  
            .attr("y1", 0 + offset_xlabel)
            .attr("x2", x(law1)) 
            .attr("y2", height + offset_xlabel)
            .style("stroke-width", 0.4)
            .style("stroke", "#999999")

        graph
            .append("line")
            .attr("x1", x(law2))  
            .attr("y1", 0 + offset_xlabel)
            .attr("x2", x(law2)) 
            .attr("y2", height + y.bandwidth() + offset_xlabel)
            .style("stroke-width", 0.4)
            .style("stroke", "#999999")

        label = graph
            .append("text")
            .attr("y", height + offset_xlabel)
            .attr("fill", "#999999")
            .attr("dy", "1.2em")
            .style("font-size", nomalFontSize +"px")

        label
            .append("tspan")
            .text("Нарушение")
            .attr("x", x(law2))
            .attr("dx", "-0.4em")
            .attr("text-anchor", "end")

        label
            .append("tspan")
            .text("таможенных")
            .attr("x", x(law2))
            .attr("dx", "-0.4em")
            .attr("dy", "1.2em")
            .attr("text-anchor", "end")

        label
            .append("tspan")
            .text("правил")
            .attr("x", x(law2))
            .attr("dx", "-0.4em")
            .attr("dy", "1.2em")
            .attr("text-anchor", "end")
    }
    })
}

define_styles()
build_graph()

var t = null;
window.onresize = function(event) {
    if (t!= null) clearTimeout(t);
    t = setTimeout(function() {
        $( "svg.canvas" ).remove();
        $( "div.tooltip" ).remove();
        define_styles()
        build_graph()
    }, 500);
};