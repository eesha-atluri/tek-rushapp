import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "30s", target: 25 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "20s", target: 0 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2000"],
    checks: ["rate>0.98"],
  },
};

const BASE_URL = "https://tek-rushapp.vercel.app/";

export default function () {
  const res = http.get(`${BASE_URL}/`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "loads under 2 seconds": (r) => r.timings.duration < 2000,
  });

  sleep(2);
}