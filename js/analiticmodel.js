var Exp = 0;
var K1 = 0.995;
var delta = 0.05;
var K2 = 100;
var variables_name = [];
var Precision = 3;
//Helper
function step(p) {
    return 1/Math.pow(10, p);
}
function format(x){
    var base = Math.pow(10, Precision);
    return Math.round(x * base) / base
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
//Input
function inputData(variables_name) {
    var variables = {};
    var el;
    for (var i = 0; i < variables_name.length; ++i) {
        el = document.getElementById(variables_name[i]).value;
        variables[variables_name[i]] = Number(el);

    }
    return variables
}
function inputDatas(n, variables_name) {
    var outputVariables = new Array();
    var el;
    var full_name;
    for (var j = 0; j < n; ++j) {
        var variables = {};
        for (var i = 0; i < variables_name.length; ++i) {
            full_name = variables_name[i] + j;
            el = document.getElementById(full_name).value;
            variables[variables_name[i]] = Number(el);
        }
        outputVariables.push(variables);
    }

    return outputVariables
}
//Main calculate

function inputDataForm(n, field_name) {
    console.log(field_name);
    var headers = headerWrapper("Номер эксперимента");
    for (var i = 1; i <= n; ++i){
        headers += headerWrapper(i);
    }
    var row = rowWrapper(headers);
    var thead = threadWrapper(row);
    var tbody = '';

    for (var j = 0; j < field_name.length; j++) {
        var name = field_name[j];
        var current_row = cellWrapper(name);
        var id = '';
        for (i = 0; i < n; ++i) {
            id = ''+ name +i;
            current_row += cellWrapperId(id)
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
        return "<th class='header'>" + data + "</th>"
    }

    function cellWrapper(data) {
        return "<td class='header'>" + data + "</td>"
    }
    function cellWrapperId(id) {
        return '<td><input  type="number"  step= "'+step(Precision)+'" class="validate stepable" id="' + id + '" > </td>'
    }
    var button = '<a class="btn" id="calculate" style="width:100%;" onclick="GetOptions();Main();">Расчитать</a>';
    $("#table_body").remove();
    $("#table_head").remove();
    $("#inputForm").append(thead);
    $("#inputForm").append(tbody);
    $("#calculate").remove();
    $("#main").append(button);
    $("#table_body_out").remove();
    $("#table_head_out").remove();
}

function analyticalModeling(N,T_o,T_p,t_k,C,t_pr,D,t_d,P) {
    //console.log(N);
    //console.log(T_o);
    //console.log(T_p);
    //console.log(t_k);
    //console.log(C);
    //console.log(t_pr);
    //console.log(D);
    //console.log(t_d);
    //console.log(P);
    //1.
    //К1 принимает значения в диапазоне 0.9...0.999995, по умолчанию 0,995.
    //var K1 = 0.995;
    //b - среднее количество проходов запроса по тракту процессор-диски за время одного цикла его обработки в системе.
    var b = 1/(1-P);
    //tк – среднее значение времени обработки запроса в канале передачи данных;
    var tk = 0.5 * (t_k + t_k);
    //s = n – количество серверов, обслуживающих рабочие станции;
    //Pi- - вероятность обращения к i-му диску сервера
    var Pi = 1/D;
    //lf1 - среднее значение суммарной интенсивности фонового потока запросов,выходящих из ОА, имитирующих работу рабочих станций, в канал
    var arr = [1/(2*tk),C/(b*t_pr),1/(b*Pi*t_d)];
    console.log("arr: " + arr);
    var a = Find_min(arr).min;
    console.log("a: " + a);
    var lf1 = K1 * a * (N-1)/N;
    console.log("lf1: " + lf1);

    //4.
    //∆ может принимать значения в диапазоне от 0,000001 до 0,9. По умолчанию 0,05
    //var delta =  0.05;
    var b1 = 0;
    var counter = 0;

    do {
        ++counter;
    lf1 -= b1;
    //2.
    //Tk - средние времена пребывания запроса в узлах системы: канале
    var Tk = (2 * tk)/(1-2*lf1*t_k);
    //Tpr - средние времена пребывания запроса в узлах системы: процессоре
    var Tpr = b * t_pr/(1 - Math.pow((b*lf1*t_pr/C),C));
    //Td - средние времена пребывания запроса в узлах системы: дисках:
    var Td =  b * t_d/(1 - b*Pi*lf1*t_d);

    //3.
    //lf - интенсивность фонового потока после очередной итерации
    var Tcycle = T_o+T_p+Tk+Tpr+Td;
    var lf =  (N-1)/Tcycle;

    //5.
    //К2 принимает значения в диапазоне 10...100000, по умолчанию 100
    //var K2 = 100;
    b1 = (lf1 - lf) / K2
    }
    while(Math.abs((lf1-lf)/lf)>=delta);

    //Определяем загрузку основных узлов системы: рабочей станции, пользователя, канала передачи данных, процессора и дисков сервера.

    var p_PC = (T_o + T_p) / Tcycle;
    var p_user = T_p / Tcycle;
    var l = N / Tcycle;
    var p_k = 2 * l * tk;
    var p_pr = b * l * t_pr / C;
    var p_d = b * l * Pi * t_d;
    var Treact = T_o+Tk+Tpr+Td;

    //console.log("p_PC: " + p_PC);
    //console.log("p_user: " + p_user);
    //
    //console.log("p_k: " + p_k);
    //console.log("p_pr: " + p_pr);
    //console.log("p_d: " + p_d);
    //
    //console.log("Tц: " + Tcycle);
    //console.log("Treact: " + Treact);
    //
    //console.log("lf: " + lf);
    //console.log("counter: " + counter);
    //
    //console.log("l: " + l);

    return {p_PC: format(p_PC), p_user: format(p_user), p_k: format(p_k), p_pr: format(p_pr), p_d: format(p_d), Tcycle: format(Tcycle),
        Treact: format(Treact)};



}
function outputResult(n, result_arr) {
    var headers = headerWrapper("Номер эксперимента");
    for (var i = 1; i <= n; ++i){
        headers += headerWrapper(i);
    }
    var row = rowWrapper(headers);
    var thead = threadWrapper(row);
    var tbody = '';

    for (key in result_arr[0]) {
        var current_row = cellWrapper(key);
        for (i = 0; i < n; ++i) {
            current_row += cellWrapper(result_arr[i][key])
        }
        tbody += rowWrapper(current_row);

    }
    tbody = tbodyWrapper(tbody);

    function threadWrapper(data) {
        return "<thead id=table_head_out>" +  data + "</thead>"
    }

    function tbodyWrapper(data) {
        return "<tbody id=table_body_out>" +  data + "</tbody>"
    }

    function rowWrapper(data){
        return "<tr>" +  data + "</tr>"
    }

    function headerWrapper(data) {
        return "<th class='header'>" + data + "</th>"
    }

    function cellWrapper(data) {
        return "<td class='header'>" + data + "</td>"
    }
    $("#table_body_out").remove();
    $("#table_head_out").remove();
    $("#result").append(thead);
    $("#result").append(tbody);

}

function GetOptions() {
    //Опции моделирования
    var options_name = ["Exp", "K1", "delta", "K2", "Precision"];
    var options = inputData(options_name);
    Exp = options[options_name[0]] || Exp;
    K1 = options[options_name[1]] || K1;
    delta = options[options_name[2]] || delta;
    K2 = options[options_name[3]] || K2;
    Precision = options[options_name[4]] || Precision;

    console.log(Exp);
    console.log(Precision);
    console.log(K1);
    console.log(delta);
    console.log(K2);

}
function showInputForm() {
    GetOptions();
    variables_name = ["N","T_o","T_p","t_k","C","t_pr","D","t_d","P"];
    inputDataForm(Exp, variables_name);
}
function Main() {

    //Вывод
    var inputDataValues = inputDatas(Exp, variables_name);

    //Расчет
    //
    var result;
    var result_arr = new Array();
    for (var i = 0; i < Exp; ++i) {
        var N = inputDataValues[i]["N"] || 0;
        var T_o = inputDataValues[i]["T_o"] || 0;
        var T_p = inputDataValues[i]["T_p"] || 0;
        var t_k = inputDataValues[i]["t_k"] || 0;
        var C = inputDataValues[i]["C"] || 0;
        var t_pr = inputDataValues[i]["t_pr"] || 0;
        var D = inputDataValues[i]["D"] || 0;
        var t_d = inputDataValues[i]["t_d"] || 0;
        var P = inputDataValues[i]["P"] || 0;
        result = analyticalModeling(N,T_o,T_p,t_k,C,t_pr,D,t_d,P);
        result_arr.push(result);
    }

    outputResult(Exp, result_arr);
}

