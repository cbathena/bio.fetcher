/* jshint node: true, esversion: 6 */

const http = require('http');
const cheerio = require('cheerio');

function get_html() {

    var data_string = "";

    const option = {
        hostname: "freefutures.org",
        port: 80,
        path: "/about/free-team/free-minds-network",
        method: "GET"
    };

    var req = http.request(option, function (res) {
        res.on('data', function (data) {
            data_string += data.toString();
        });
        res.on('end', function () {
            parse_html(data_string);
        });
    }).end();

}

function parse_html(html_string) {

    var href_list = [];

    var $ = cheerio.load(html_string, {
        xmlMode: true,
        decodeEntities: true
    });
    var al = $("body > div.site-container > div.site-inner > div > main > article > div > figure > a");
    al.each(function (i, elem) {
        href_list.push(elem.attribs.href);
    });

}

function wide_get_html_again(hl) {

}

get_html();