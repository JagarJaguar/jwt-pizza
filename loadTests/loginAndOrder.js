import { sleep, check, group, fail } from 'k6';
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response

  const vars = {}

  group('page_1 - https://pizza.jagarlol.com/', function () {
    response = http.get('https://pizza.jagarlol.com/', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'if-modified-since': 'Tue, 20 Oct 2026 05:19:19 GMT',
        'if-none-match': '"f82a947302cb75915d4b9131d80954e0"',
        priority: 'u=0, i',
        'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(4.8)

    response = http.put(
      'https://pizza-service.jagarlol.com/api/auth',
      '{"email":"d2@jwt.com","password":"12345"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.jagarlol.com',
          priority: 'u=1, i',
          'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    if (!check(response, { 'login status equals 200': (response) => response.status.toString() === '200' })) {
  console.log(response.body);
  fail('Login was *not* 200');
}

    vars['token1'] = jsonpath.query(response.json(), '$.token')[0]

    sleep(1.7)

    response = http.get('https://pizza-service.jagarlol.com/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.jagarlol.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.get('https://pizza-service.jagarlol.com/api/franchise?page=0&limit=20&name=*', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.jagarlol.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(3.2)

    response = http.get('https://pizza-service.jagarlol.com/api/user/me', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.jagarlol.com',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(0.9)

    response = http.post(
      'https://pizza-service.jagarlol.com/api/order',
      '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.jagarlol.com',
          priority: 'u=1, i',
          'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
if (!check(response, { 'purchase status equals 200': (response) => response.status.toString() === '200' })) {
      console.log(response.body)
      fail('Purchase was *not* 200')
    }
    sleep(1.2)

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      '{"jwt":"eyJpYXQiOjE3OTQ1MjQ1NjksImV4cCI6MTc5NDYxMDk2OSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9TcF94VzhlM3kwNk1KS3ZIeW9sRFZMaXZXX2hnTWxhcFZSUVFQVndiY0UifQ.eyJ2ZW5kb3IiOnsiaWQiOiJhcHJvbWEiLCJuYW1lIjoiQXNodG9uIFJvbWEifSwiZGluZXIiOnsiaWQiOjUsIm5hbWUiOiJkZWV6IiwiZW1haWwiOiJkMkBqd3QuY29tIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjEsImRlc2NyaXB0aW9uIjoiVmVnZ2llIiwicHJpY2UiOjAuMDAzOH1dLCJzdG9yZUlkIjoiMSIsImZyYW5jaGlzZUlkIjoxLCJpZCI6MTYyfX0.BKohuBZa3eABR8ncv6XHhgQYiCtOnXV7nqgQ80GZu9Jwx54zSJ145NipD-085LmlR7BQki2X6fOOTUhO9U8gKpR4idLcXodZ6PWbDOWftZdD5-9VZLTjGQkuidOY5cxQuNNoRtivLXK-PTk1o6xJwdnGWkFWvkP_XGcpbYQIx8mitTGOr1TRU1llGfaQ_3arkY1XI9Ptp2gMjrV-R0wRk76NFoLO0sr3DUU4U6ix5pc35YCcyorsAhwe-hgiNFvmNndSSv-98D5l57jKGX1twcNuQJJ_kcmUGxCKODVBChcRPhUza7WEUGdkHOe1DLcEzpjBQSpEsypI8wSRn59GgXyWGpSULqhHXSAxXQ3RcarTY_PYTwMqikJg6vYxuQsO3tA3Q9wv6CdeqWVQpBYNl6NFaAPqcctE6axl5_VAFTNBzNU4TFMqGJifIR4QEaBfqXpEalO6c9zcatsoBL0v2BJIkYYUzVZ11Sm81vgLiCk7wFnVQBcSHM_sKmV_GM30q1MU2exOBVqxG9jGnRYMXkHtOBIRQJi0Y13nIELxVDq1WIPoQFeEEYoL61w3QHlOnCJLffes0whLPEzGely93ktQnOqmNS1M5nr9atpyOOHy6WbgPVQgbdkRpgzbfMSXskQqTG5SqcjLonrzAJJwosgP9eS4lY-kRbtASQ3hHy0"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.jagarlol.com',
          priority: 'u=1, i',
          'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-fetch-storage-access': 'active',
        },
      }
    )
  })
}
