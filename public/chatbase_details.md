widget setup:
<script>
(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="u-Y9MHASFos_xwosYW3Eo";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
</script>

identtity verification:
bbgpejt5mxfsq5d72i7f7xyrlntkg0i6

identity verification script:
// --- SERVER CODE ---
const jwt = require('jsonwebtoken');

const secret = process.env.CHATBOT_IDENTITY_SECRET; // Your chatbase secret key (should be stored as a secret not in the code)

const user = await getSignedInUser(); // Get the current user signed in to your site

const token = jwt.sign(
    {
        user_id: user.id, // Your user's id
        email: user.email, // User's email
        stripe_accounts: user.stripe_accounts, // User's stripe accounts for stripe integration
        // ... other custom attributes
    },
    secret,
    { expiresIn: '1h' }
);

// --- CLIENT CODE ---
const token = await getUserToken(); // Get the token from your server
window.chatbase('identify', { token }); // identify the user with Chatbase

