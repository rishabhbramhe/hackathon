function init(){
    gsap.registerPlugin(ScrollTrigger);

// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#main"),
  smooth: true
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", ScrollTrigger.update);

// tell ScrollTrigger to use these proxy methods for the "#main" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy("#main", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});





// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();
}
init()

function loader(){
 
/*
Playing around with gsap3. I really would recommend their splitText for this though. This is the poor mans solution.

Also a big heads up for greensocks great documentation on this stuff. 
*/

function animateIntro (element){
  let newText = "";
  let introText = document.querySelector(element);
  for (i = 0; i < introText.innerText.length; i++) {
    newText += "<div>";
    // for blank space
    if (introText.innerText[i] == " "){newText += "&nbsp;"}
    else {newText += introText.innerText[i];}
    newText += "</div>";
  }
  introText.innerHTML = newText;

  const targetsDiv = document.querySelectorAll(element+" div");

  let animation = gsap.timeline();

animation
.fromTo(targetsDiv, 2, {
     opacity:0, y:90, ease: Elastic.easeOut.config(1.2, 0.5)
 }, {
     opacity:1, y:0, stagger: 0.1, ease: Elastic.easeOut.config(1.2, 0.5), 
 })
 .fromTo('.sub-intro', {opacity:0, y:80}, {opacity:1, y:0, duration:1.2}, '<2.3')
    .to('#container .bg-intro', {yPercent:-100, stagger:0.5, duration:1, delay: 1})
    // .to('#intro', {y:-window.innerHeight, duration: 1.2}, '<')
    // .to('.sub-intro', {y:-window.innerHeight, duration: 1.2}, '-=1.5')
}

document.addEventListener("DOMContentLoaded", function(event) {
  animateIntro("#intro");
});

 gsap.from("#loader>img",{
  scale:0,
  delay:1
  
 })
 gsap.to("#loader",{
  height:0,
  delay:3
 })
}
loader()

function pageTwoAnimation(){

  gsap.registerPlugin(ScrollTrigger);

  let iteration = 0; 
  
  const spacing = 0.1,  
    snap = gsap.utils.snap(spacing), 
    cards = gsap.utils.toArray('.cards li'),
    seamlessLoop = buildSeamlessLoop(cards, spacing),
    scrub = gsap.to(seamlessLoop, { 
      totalTime: 0,
      duration: 0.5,
      ease: "power3",
      paused: true
    }),
    trigger = ScrollTrigger.create({
      start: 0,
      onUpdate(self) {
        if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
          wrapForward(self);
        } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
          wrapBackward(self);
        } else {
          scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
          scrub.invalidate().restart(); 
          self.wrapping = false;
        }
      },
      end: "+=3000",
      pin: ".gallery"
    });
  
  function wrapForward(trigger) { // when the ScrollTrigger reaches the end, loop back to the beginning seamlessly
    iteration++;
    trigger.wrapping = true;
    trigger.scroll(trigger.start + 1);
  }
  
  function wrapBackward(trigger) { // when the ScrollTrigger reaches the start again (in reverse), loop back to the end seamlessly
    iteration--;
    if (iteration < 0) { // to keep the playhead from stopping at the beginning, we jump ahead 10 iterations
      iteration = 9;
      seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
      scrub.pause(); // otherwise it may update the totalTime right before the trigger updates, making the starting value different than what we just set above. 
    }
    trigger.wrapping = true;
    trigger.scroll(trigger.end - 1);
  }
  
  function scrubTo(totalTime) { // moves the scroll position to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
    let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
    if (progress > 1) {
      wrapForward(trigger);
    } else if (progress < 0) {
      wrapBackward(trigger);
    } else {
      trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
    }
  }
  
  document.querySelector(".next").addEventListener("click", () => scrubTo(scrub.vars.totalTime + spacing));
  document.querySelector(".prev").addEventListener("click", () => scrubTo(scrub.vars.totalTime - spacing));
  
  
  
  
  function buildSeamlessLoop(items, spacing) {
    let overlap = Math.ceil(1 / spacing),
      startTime = items.length * spacing + 0.5, 
      loopTime = (items.length + overlap) * spacing + 1,
      rawSequence = gsap.timeline({paused: true}), 
      seamlessLoop = gsap.timeline({ 
        paused: true,
        repeat: -1, 
        onRepeat() {
          this._time === this._dur && (this._tTime += this._dur - 0.01);
        }
      }),
      l = items.length + overlap * 2,
      time = 0,
      i, index, item;
  
    gsap.set(items, {xPercent: 200, opacity: 0,	scale: 0});
  
 
    for (i = 0; i < l; i++) {
      index = i % items.length;
      item = items[index];
      time = i * spacing;
      rawSequence.fromTo(item, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false}, time)
                 .fromTo(item, {xPercent: 280}, {xPercent: -300, duration: 1, ease: "none", immediateRender: false}, time);
      i <= items.length && seamlessLoop.add("label" + i, time); 
    }
    
   
    rawSequence.time(startTime);
    seamlessLoop.to(rawSequence, {
      time: loopTime,
      duration: loopTime - startTime,
      ease: "none"
    }).fromTo(rawSequence, {time: overlap * spacing + 1}, {
      time: startTime,
      duration: startTime - (overlap * spacing + 1),
      immediateRender: false,
      ease: "none"
    });
    return seamlessLoop;
  }
  
  
}
pageTwoAnimation()

  function pageThreeAnimation(){
    
      var tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#page3",
            start: "top top",
            scrub: 2,
            pin: true,
            scroller:"#main"
        }
      })

      .to("#drawing",{
        top:"-5%",
        duration:10,
        ease: Expo.SlowMo
       },"same")

       .to("#drawing1",{
        top:"7%",
        duration:10,
        ease: Expo.SlowMo
       },"same")

       .to("#drawing2",{
        top:"2%",
        duration:10,
        ease: Expo.SlowMo
       },"same")

       .to("#product1>img",{
        y:-1000,
        duration:10,
        delay:10,
        ease: Expo.SlowMo
       },"same")

       .to("#arts1",{
        opacity:0,
        duration:5,
       })

       .to("#p1",{
        top:"0%",
        duration:10,
        ease: Expo.SlowMo,
        delay:-7
       },"sm")

       .to("#arts2",{
        opacity:1,
        duration:4,
       })

       .to("#p2",{
        top:"3%",
        duration:10,
        ease: Expo.SlowMo,
        delay:-5
       },"sm")

       .to("#p3",{
        top:"2%",
        duration:10,
        ease: Expo.SlowMo,
        delay:-6
       },"sm")
    }
    pageThreeAnimation()

    var circle = document.querySelector("#circl");
    var nav = document.querySelector("#centre>h1");

    window.addEventListener("mousemove",function(dets){
      gsap.to(circle, {
              x:dets.clientX,
              y:dets.clientY
      })

    })


    nav.addEventListener("mousemove",function(dets){
      gsap.to(circle, {
              scale:5,
              backgroundColor:"rgba(0, 0, 0, 0.296)"
              
      })
      gsap.to("#nav>h1", {
        color:"#fff",    
})

    })
   nav.addEventListener("mouseleave",function(dets){
    gsap.to(circle, {
            scale:1,   
            backgroundColor:"#4b414100"  
    })
gsap.to("#nav>h1", {
color:"#000",    
})

    

  })




    function pageFourAnimation(){
    
      gsap.registerPlugin(ScrollTrigger);
    
      let iteration = 0; // gets iterated when we scroll all the way to the end or start and wraps around - allows us to smoothly continue the playhead scrubbing in the correct direction.
      
      const spacing = 0.1,    // spacing of the cards (stagger)
        snap = gsap.utils.snap(spacing), // we'll use this to snap the playhead on the seamlessLoop
        cards = gsap.utils.toArray('.cards2 li'),
        seamlessLoop = buildSeamlessLoop(cards, spacing),
        scrub = gsap.to(seamlessLoop, { // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
          totalTime: 0,
          duration: 0.5,
          ease: "power3",
          paused: true
        }),
        trigger = ScrollTrigger.create({
          start: 0,
          onUpdate(self) {
            if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
              wrapForward(self);
            } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
              wrapBackward(self);
            } else {
              scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
              scrub.invalidate().restart(); // to improve performance, we just invalidate and restart the same tween. No need for overwrites or creating a new tween on each update.
              self.wrapping = false;
            }
          },
          end: "+=3000",
          pin: ".gallery2"
        });
      
      function wrapForward(trigger) { // when the ScrollTrigger reaches the end, loop back to the beginning seamlessly
        iteration++;
        trigger.wrapping = true;
        trigger.scroll(trigger.start + 1);
      }
      
      function wrapBackward(trigger) { // when the ScrollTrigger reaches the start again (in reverse), loop back to the end seamlessly
        iteration--;
        if (iteration < 0) { // to keep the playhead from stopping at the beginning, we jump ahead 10 iterations
          iteration = 9;
          seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
          scrub.pause(); // otherwise it may update the totalTime right before the trigger updates, making the starting value different than what we just set above. 
        }
        trigger.wrapping = true;
        trigger.scroll(trigger.end - 1);
      }
      
      function scrubTo(totalTime) { // moves the scroll position to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
        let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
        if (progress > 1) {
          wrapForward(trigger);
        } else if (progress < 0) {
          wrapBackward(trigger);
        } else {
          trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
        }
      }
      
      document.querySelector(".next2").addEventListener("click", () => scrubTo(scrub.vars.totalTime + spacing));
      document.querySelector(".prev2").addEventListener("click", () => scrubTo(scrub.vars.totalTime - spacing));
      
      
      
      
      function buildSeamlessLoop(items, spacing) {
        let overlap = Math.ceil(1 / spacing), // number of EXTRA animations on either side of the start/end to accommodate the seamless looping
          startTime = items.length * spacing + 0.5, // the time on the rawSequence at which we'll start the seamless loop
          loopTime = (items.length + overlap) * spacing + 1, // the spot at the end where we loop back to the startTime 
          rawSequence = gsap.timeline({paused: true}), // this is where all the "real" animations live
          seamlessLoop = gsap.timeline({ // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
            paused: true,
            repeat: -1, // to accommodate infinite scrolling/looping
            onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
              this._time === this._dur && (this._tTime += this._dur - 0.01);
            }
          }),
          l = items.length + overlap * 2,
          time = 0,
          i, index, item;
      
        // set initial state of items
        gsap.set(items, {xPercent: 400, opacity: 0,	scale: 0});
      
        // now loop through and create all the animations in a staggered fashion. Remember, we must create EXTRA animations at the end to accommodate the seamless looping.
        for (i = 0; i < l; i++) {
          index = i % items.length;
          item = items[index];
          time = i * spacing;
          rawSequence.fromTo(item, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false}, time)
                     .fromTo(item, {xPercent: 400}, {xPercent: -400, duration: 1, ease: "none", immediateRender: false}, time);
          i <= items.length && seamlessLoop.add("label" + i, time); // we don't really need these, but if you wanted to jump to key spots using labels, here ya go.
        }
        
        // here's where we set up the scrubbing of the playhead to make it appear seamless. 
        rawSequence.time(startTime);
        seamlessLoop.to(rawSequence, {
          time: loopTime,
          duration: loopTime - startTime,
          ease: "none"
        }).fromTo(rawSequence, {time: overlap * spacing + 1}, {
          time: startTime,
          duration: startTime - (overlap * spacing + 1),
          immediateRender: false,
          ease: "none"
        });
        return seamlessLoop;
      }
      
      
    }
    pageFourAnimation() 
    