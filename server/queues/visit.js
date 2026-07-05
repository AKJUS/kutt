const useragent = require("express-useragent").default;
const geoip = require("geoip-lite");
const URL = require("node:url");

const { removeWww, getUseragentBrowser, getUseragentOS } = require("../utils");
const query = require("../queries");

module.exports = function({ data }) {
  const tasks = [];
  
  tasks.push(query.link.incrementVisit({ id:  data.link.id }));
  
  // the following line is for backward compatibility
  // used to send the whole header to get the user agent
  const userAgent = data.userAgent || data.headers?.["user-agent"];
  const agent = useragent.parse(userAgent);
  const browser = getUseragentBrowser(agent);
  const os = getUseragentOS(agent);
  const referrer = data.referrer && removeWww(URL.parse(data.referrer).hostname);
  const country = data.country || geoip.lookup(data.ip)?.country || "Unknown";

  tasks.push(
    query.visit.add({
      browser,
      country,
      os,
      link_id: data.link.id,
      user_id: data.link.user_id,
      referrer: (referrer && referrer.replace(/\./gi, "[dot]")) || "Direct"
    })
  );

  return Promise.all(tasks);
}
