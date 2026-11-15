import { ASP, PLATE_WIDTHS, THEME } from "./sky"

// Inline <head> script: picks the still photo for the visitor's clock before first paint and exposes
// it as --scene-poster, so the scene (and the quiet backgrounds on other pages) never flash empty.
// The still is AVIF or WebP at the width plateWidth() in ./sky would pick, where image-set() can choose
// by type, and the original JPEG elsewhere. A theme-color tag with the plate's sky colour goes first in
// <head>, where it wins over the layout's default; editing that one instead makes React re-add it on hydration.
// Mirrors posterPlate(skyAt(nowHour())) from ./sky: sky() blends with smoothstep, whose output passes
// 0.5 at the midpoint of each band, so night -> twilight at e > -7.5 and twilight -> day at e > 13.
export const POSTER_SCRIPT = `(function(){try{
var D=Math.PI/180,LAT=11.2*D,n=new Date(),h=n.getHours()+n.getMinutes()/60+n.getSeconds()/3600;
var doy=Math.floor((n-new Date(n.getFullYear(),0,0))/864e5),dec=23.44*D*Math.sin(2*Math.PI*(284+doy)/365);
var H=(h-12.05)*15,e=Math.asin(Math.sin(LAT)*Math.sin(dec)+Math.cos(LAT)*Math.cos(dec)*Math.cos(H*D))/D;
var tw=H<0?"sunrise":"sunset",p=e<=-7.5?"night":e<=13?tw:"day";
var W=${JSON.stringify(PLATE_WIDTHS)},need=Math.max(innerWidth,innerHeight*${ASP})*Math.min(devicePixelRatio||1,2),w=W[W.length-1];
for(var i=0;i<W.length;i++)if(W[i]>=need){w=W[i];break}
var f="/scenery/elnido/"+p+"-"+w+".",r=document.documentElement;
var set=CSS.supports("background-image",'image-set(url("x.avif") type("image/avif"))');
r.style.setProperty("--scene-poster",set?'image-set(url("'+f+'avif") type("image/avif"), url("'+f+'webp") type("image/webp"))':"url(/scenery/elnido/"+p+".jpg)");r.dataset.plate=p;
var l=document.createElement("link");l.rel="preload";l.as="image";
if(set){l.href=f+"avif";l.type="image/avif"}else l.href="/scenery/elnido/"+p+".jpg";document.head.appendChild(l);
var m=document.createElement("meta");m.name="theme-color";m.content=${JSON.stringify(THEME)}[p];document.head.prepend(m);
}catch(_){}})();`
