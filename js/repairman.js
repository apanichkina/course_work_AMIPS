var t_no = 0; // среднее время наработки на отказ 1 компьютера
var t_o = 0; // среднее время ремонта 1 компьютера
var N = 0; // число компьютеров
var C = 0; // число ремонтников
var L = 0; // число ПВ в нерабочем состоянии
var Tp = 0; // время неисправного состояния
function Factorial (n) {
    if (n < 0) return 0;
    var result = 1;
    if (n > 0)  for (var i = n; i > 1; --i) {
        result *= i;
    }
    return result;

}
function ClosedSMO (t_no, t_o, N, C, S, S1) {
    t_no = Number(t_no);
    t_o = Number(t_o);
    N = Number(N);
    C = Number(C);
    L = 0;
    Tp = 0;
    var F = t_o/t_no; //фи

    //1. Вероятности состояний рассматриваемой замкнутой СМО
    var P0_1 = 0;
    var P0_2 = 0;
    for (var k = 0; k <= C; ++k) {
        P0_1 += (Factorial(N) / Factorial(N - k)) * Math.pow(F, k) / Factorial(k);
    }
    for (k = C + 1; k <= N; ++k) {
        P0_2 += (Factorial(N) / (Factorial(N - k) * Factorial(C))) * Math.pow(F,k) / Math.pow(C,k - C);
    }
    var P0 = 1 / (P0_1 + P0_2);

    //2. Q - Среднее число компьютеров, находящихся в очереди на ремонт
    var Q = 0;
    for (k = C + 1; k <= N ; ++k) {
        Q += (k - C) * P0 * (Factorial(N) / (Factorial(N - k) * Factorial(C))) * Math.pow(F,k) / Math.pow(C,k - C);
    }

    //3. L - Среднее число компьютеров, находящихся в неисправном состоянии, т.е. в очереди на ремонт и на ремонте
    if (L == 0 ) { //если данное значение не задано
        for (k = 1; k <= N; ++k) {
            if (k <= C){
                L += k * P0 * (Factorial(N)/Factorial(N - k)) * Math.pow(F, k) / Factorial(k);
            }
            else {
                L += k * P0 *  (Factorial(N) / (Factorial(N - k) * Factorial(C))) * Math.pow(F,k) / Math.pow(C,k - C);
            }
        }
    }

    //4. U - Среднее число компьютеров, которое непосредственно ремонтируется специалистами
    var U = L - Q;

    //5. p0 - Коэфф загрузки одного ремонтника
    var p0 = U / C;

    //6. n - Среднее число неисправных компьютеров
    var n = N - L;

    //7. Tp = Среднее время прибывания компьютера в неисправном состоянии
    if (Tp == 0) {
        Tp = L * t_no / n;
    }

    //8. W - Среднее время нахождения компьютера на ремонта
    var W = Tp - t_o;

    //9. Tc - Среднее время цикла для компьютера
    var Tc= Tp + t_no;

    //10. pe - Коэфф. загрузки компьютера (доля времени в исправном состоянии)
    var pe = t_no / Tc;
    //var pe = n / N;

    //11. Анализ сбалансированности pe/p0
    var balance = (C * t_no) / (N * t_o );
    function format(x){
        var precision = 5;
        var base = Math.pow(10, precision);
        return Math.round(x * base) / base
    }
    return  {C: format(C), P0: format(P0), Q: format(Q), L: format(L), U: format(U), p0: format(p0),
        n: format(n), pe: format(pe), W: format(W), Tp: format(Tp), Tc: format(Tc), 'pe/p0': format(balance), Sum: format(C*S1+ L*S)};

}
function Economic_challenge(L, S, C, S1, n) {
    var Y = new Array();
    for (var i = 0; i < n; ++i){
        Y[i] = C[i] * S1 + L[i] * S;
    }
    //var z = Math.min.apply(null, Y);
    var result = Find_min(Y);
    console.log(result.min, result.index+1);

}
function Find_min(array){
    var min_ind = 0;
    var min = array[min_ind];
    var n = array.length;
    for (var i = 1; i < n; ++i){
        if (array[i] < min) {
            min = array[i];
            min_ind = i;
        }
    }
    return {min: min, index: min_ind};
}
//Graph
google.charts.load('current', {packages: ['corechart', 'line']});


function drawBasic(L_arr, S, C_arr, S1, n) {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'ЗП');
    data.addColumn('number', 'Потери');
    data.addColumn('number', 'Итог');
    for (var i = 0; i < n; ++i ){
        data.addRows([[C_arr[i], C_arr[i] * S1, L_arr[i] * S, C_arr[i] * S1 + L_arr[i] * S]]);
    }

    var options = {
        hAxis: {
            title: 'Ремонтники'
        },
        vAxis: {
            title: 'Руб./час'
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);

}
function inputData(variables_name) {
    var variables = {};
    var el;
    for (var i = 0; i < variables_name.length; ++i) {
        el = document.getElementById(variables_name[i]).value;
        variables[variables_name[i]] = Number(el);

    }
    return variables
}
function outputResult(n, result_arr) {
    var headers = headerWrapper("Параметр");
    for (var i = 1; i <= n; ++i){
        headers += headerWrapper("Вариант №" + i);
    }
    var row = rowWrapper(headers);
    var thead = threadWrapper(row);
    var tbody = '';

    for (key in result_arr[0]) {
        var id = '';
        var current_row = cellWrapper(key);
        for (i = 0; i < n; ++i) {
            id = ''+key+i;
            current_row += cellWrapperId(result_arr[i][key],id)
        }
        tbody += rowWrapper(current_row);

    }
    tbody = tbodyWrapper(tbody);

    function threadWrapper(data) {
        return "<thead id=table_head>" +  data + "</thead>"
    }

    function tbodyWrapper(data) {
        return "<tbody id=table_body>" +  data + "</tbody>"
    }

    function rowWrapper(data){
        return "<tr>" +  data + "</tr>"
    }

    function headerWrapper(data) {
        return "<th>" + data + "</th>"
    }

    function cellWrapper(data) {
        return "<td>" + data + "</td>"
    }
    function cellWrapperId(data, id) {
        return "<td id='" + id + "' >" + data + "</td>"
    }
    $("#table_body").remove();
    $("#table_head").remove();
    $("#result").append(thead);
    $("#result").append(tbody);

}


function Main() {
    var variables_name = ["t_no","t_o","N","C","S1","S"];
    var variables = inputData(variables_name);
    console.log(variables);
    var result;
    var result_arr = new Array();
    var n = variables[variables_name[3]];
    var S1 = variables[variables_name[4]]; // з.п. ремонтника руб./ч.
    var S = variables[variables_name[5]]; // финансовые потери от простоя 1 компьютера руб./ч.
    var C_arr = new Array();
    var L_arr = new Array();
    for (var i = 1;i <= n; ++i){
        result = ClosedSMO(variables[variables_name[0]], variables[variables_name[1]],variables[variables_name[2]], i, S, S1);
        L_arr.push(result.L);
        C_arr.push(result.C);
        result_arr.push(result);
    }
    Economic_challenge(L_arr, S, C_arr, S1, n);
    drawBasic(L_arr, S, C_arr, S1, n);
    console.log("Факториал:"+Factorial());
    outputResult(n, result_arr);
    console.log(result_arr);
}

