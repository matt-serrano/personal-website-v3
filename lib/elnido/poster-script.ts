// Inline <head> script: picks the still photo for the visitor's clock before first paint and exposes
// it as --scene-poster, so the scene (and the quiet backgrounds on other pages) never flash empty.
// Mirrors posterPlate(skyAt(nowHour())) from ./sky: sky() blends with smoothstep, whose output passes
// 0.5 at the midpoint of each band, so night -> twilight at e > -7.5 and twilight -> day at e > 13.
export const POSTER_SCRIPT = `(function(){try{
var D=Math.PI/180,LAT=11.2*D,n=new Date(),h=n.getHours()+n.getMinutes()/60+n.getSeconds()/3600;
var doy=Math.floor((n-new Date(n.getFullYear(),0,0))/864e5),dec=23.44*D*Math.sin(2*Math.PI*(284+doy)/365);
var H=(h-12.05)*15,e=Math.asin(Math.sin(LAT)*Math.sin(dec)+Math.cos(LAT)*Math.cos(dec)*Math.cos(H*D))/D;
var tw=H<0?"sunrise":"sunset",p=e<=-7.5?"night":e<=13?tw:"day";
var u="/scenery/elnido/"+p+".jpg",r=document.documentElement;
r.style.setProperty("--scene-poster","url("+u+")");r.dataset.plate=p;
var l=document.createElement("link");l.rel="preload";l.as="image";l.href=u;document.head.appendChild(l);
}catch(_){}})();`
