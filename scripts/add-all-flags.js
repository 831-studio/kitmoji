// Script to add ALL flag emojis to the database
const { sql } = require('@vercel/postgres');

// Complete list of all country and territory flags
const allFlags = [
  // Special flags
  { emoji: '🏁', name: 'chequered flag', keywords: 'checkered,racing,finish', unicode: '1F3C1' },
  { emoji: '🏴', name: 'black flag', keywords: 'flag,black', unicode: '1F3F4' },
  { emoji: '🏳️', name: 'white flag', keywords: 'flag,white,surrender', unicode: '1F3F3 FE0F' },
  { emoji: '🏳️‍🌈', name: 'rainbow flag', keywords: 'pride,lgbt,lgbtq,gay,rainbow', unicode: '1F3F3 FE0F 200D 1F308' },
  { emoji: '🏳️‍⚧️', name: 'transgender flag', keywords: 'transgender,trans,pride', unicode: '1F3F3 FE0F 200D 26A7 FE0F' },
  { emoji: '🏴‍☠️', name: 'pirate flag', keywords: 'pirate,skull,crossbones,jolly roger', unicode: '1F3F4 200D 2620 FE0F' },
  { emoji: '🚩', name: 'triangular flag', keywords: 'flag,red,triangular,post', unicode: '1F6A9' },
  { emoji: '🎌', name: 'crossed flags', keywords: 'japan,japanese,flags', unicode: '1F38C' },
  
  // All country and territory flags A-Z
  { emoji: '🇦🇨', name: 'flag: Ascension Island', keywords: 'ascension island,flag', unicode: '1F1E6 1F1E8' },
  { emoji: '🇦🇩', name: 'flag: Andorra', keywords: 'andorra,flag', unicode: '1F1E6 1F1E9' },
  { emoji: '🇦🇪', name: 'flag: United Arab Emirates', keywords: 'united arab emirates,uae,flag', unicode: '1F1E6 1F1EA' },
  { emoji: '🇦🇫', name: 'flag: Afghanistan', keywords: 'afghanistan,flag', unicode: '1F1E6 1F1EB' },
  { emoji: '🇦🇬', name: 'flag: Antigua & Barbuda', keywords: 'antigua,barbuda,flag', unicode: '1F1E6 1F1EC' },
  { emoji: '🇦🇮', name: 'flag: Anguilla', keywords: 'anguilla,flag', unicode: '1F1E6 1F1EE' },
  { emoji: '🇦🇱', name: 'flag: Albania', keywords: 'albania,flag', unicode: '1F1E6 1F1F1' },
  { emoji: '🇦🇲', name: 'flag: Armenia', keywords: 'armenia,flag', unicode: '1F1E6 1F1F2' },
  { emoji: '🇦🇴', name: 'flag: Angola', keywords: 'angola,flag', unicode: '1F1E6 1F1F4' },
  { emoji: '🇦🇶', name: 'flag: Antarctica', keywords: 'antarctica,flag', unicode: '1F1E6 1F1F6' },
  { emoji: '🇦🇷', name: 'flag: Argentina', keywords: 'argentina,flag', unicode: '1F1E6 1F1F7' },
  { emoji: '🇦🇸', name: 'flag: American Samoa', keywords: 'american samoa,flag', unicode: '1F1E6 1F1F8' },
  { emoji: '🇦🇹', name: 'flag: Austria', keywords: 'austria,flag', unicode: '1F1E6 1F1F9' },
  { emoji: '🇦🇺', name: 'flag: Australia', keywords: 'australia,flag', unicode: '1F1E6 1F1FA' },
  { emoji: '🇦🇼', name: 'flag: Aruba', keywords: 'aruba,flag', unicode: '1F1E6 1F1FC' },
  { emoji: '🇦🇽', name: 'flag: Åland Islands', keywords: 'aland islands,flag', unicode: '1F1E6 1F1FD' },
  { emoji: '🇦🇿', name: 'flag: Azerbaijan', keywords: 'azerbaijan,flag', unicode: '1F1E6 1F1FF' },
  
  { emoji: '🇧🇦', name: 'flag: Bosnia & Herzegovina', keywords: 'bosnia,herzegovina,flag', unicode: '1F1E7 1F1E6' },
  { emoji: '🇧🇧', name: 'flag: Barbados', keywords: 'barbados,flag', unicode: '1F1E7 1F1E7' },
  { emoji: '🇧🇩', name: 'flag: Bangladesh', keywords: 'bangladesh,flag', unicode: '1F1E7 1F1E9' },
  { emoji: '🇧🇪', name: 'flag: Belgium', keywords: 'belgium,flag', unicode: '1F1E7 1F1EA' },
  { emoji: '🇧🇫', name: 'flag: Burkina Faso', keywords: 'burkina faso,flag', unicode: '1F1E7 1F1EB' },
  { emoji: '🇧🇬', name: 'flag: Bulgaria', keywords: 'bulgaria,flag', unicode: '1F1E7 1F1EC' },
  { emoji: '🇧🇭', name: 'flag: Bahrain', keywords: 'bahrain,flag', unicode: '1F1E7 1F1ED' },
  { emoji: '🇧🇮', name: 'flag: Burundi', keywords: 'burundi,flag', unicode: '1F1E7 1F1EE' },
  { emoji: '🇧🇯', name: 'flag: Benin', keywords: 'benin,flag', unicode: '1F1E7 1F1EF' },
  { emoji: '🇧🇱', name: 'flag: St. Barthélemy', keywords: 'saint barthelemy,flag', unicode: '1F1E7 1F1F1' },
  { emoji: '🇧🇲', name: 'flag: Bermuda', keywords: 'bermuda,flag', unicode: '1F1E7 1F1F2' },
  { emoji: '🇧🇳', name: 'flag: Brunei', keywords: 'brunei,flag', unicode: '1F1E7 1F1F3' },
  { emoji: '🇧🇴', name: 'flag: Bolivia', keywords: 'bolivia,flag', unicode: '1F1E7 1F1F4' },
  { emoji: '🇧🇶', name: 'flag: Caribbean Netherlands', keywords: 'caribbean netherlands,flag', unicode: '1F1E7 1F1F6' },
  { emoji: '🇧🇷', name: 'flag: Brazil', keywords: 'brazil,flag', unicode: '1F1E7 1F1F7' },
  { emoji: '🇧🇸', name: 'flag: Bahamas', keywords: 'bahamas,flag', unicode: '1F1E7 1F1F8' },
  { emoji: '🇧🇹', name: 'flag: Bhutan', keywords: 'bhutan,flag', unicode: '1F1E7 1F1F9' },
  { emoji: '🇧🇻', name: 'flag: Bouvet Island', keywords: 'bouvet island,flag', unicode: '1F1E7 1F1FB' },
  { emoji: '🇧🇼', name: 'flag: Botswana', keywords: 'botswana,flag', unicode: '1F1E7 1F1FC' },
  { emoji: '🇧🇾', name: 'flag: Belarus', keywords: 'belarus,flag', unicode: '1F1E7 1F1FE' },
  { emoji: '🇧🇿', name: 'flag: Belize', keywords: 'belize,flag', unicode: '1F1E7 1F1FF' },
  
  { emoji: '🇨🇦', name: 'flag: Canada', keywords: 'canada,flag', unicode: '1F1E8 1F1E6' },
  { emoji: '🇨🇨', name: 'flag: Cocos (Keeling) Islands', keywords: 'cocos islands,keeling islands,flag', unicode: '1F1E8 1F1E8' },
  { emoji: '🇨🇩', name: 'flag: Congo - Kinshasa', keywords: 'congo,kinshasa,democratic republic,flag', unicode: '1F1E8 1F1E9' },
  { emoji: '🇨🇫', name: 'flag: Central African Republic', keywords: 'central african republic,flag', unicode: '1F1E8 1F1EB' },
  { emoji: '🇨🇬', name: 'flag: Congo - Brazzaville', keywords: 'congo,brazzaville,republic,flag', unicode: '1F1E8 1F1EC' },
  { emoji: '🇨🇭', name: 'flag: Switzerland', keywords: 'switzerland,flag', unicode: '1F1E8 1F1ED' },
  { emoji: '🇨🇮', name: 'flag: Côte d'Ivoire', keywords: 'cote divoire,ivory coast,flag', unicode: '1F1E8 1F1EE' },
  { emoji: '🇨🇰', name: 'flag: Cook Islands', keywords: 'cook islands,flag', unicode: '1F1E8 1F1F0' },
  { emoji: '🇨🇱', name: 'flag: Chile', keywords: 'chile,flag', unicode: '1F1E8 1F1F1' },
  { emoji: '🇨🇲', name: 'flag: Cameroon', keywords: 'cameroon,flag', unicode: '1F1E8 1F1F2' },
  { emoji: '🇨🇳', name: 'flag: China', keywords: 'china,flag', unicode: '1F1E8 1F1F3' },
  { emoji: '🇨🇴', name: 'flag: Colombia', keywords: 'colombia,flag', unicode: '1F1E8 1F1F4' },
  { emoji: '🇨🇵', name: 'flag: Clipperton Island', keywords: 'clipperton island,flag', unicode: '1F1E8 1F1F5' },
  { emoji: '🇨🇷', name: 'flag: Costa Rica', keywords: 'costa rica,flag', unicode: '1F1E8 1F1F7' },
  { emoji: '🇨🇺', name: 'flag: Cuba', keywords: 'cuba,flag', unicode: '1F1E8 1F1FA' },
  { emoji: '🇨🇻', name: 'flag: Cape Verde', keywords: 'cape verde,flag', unicode: '1F1E8 1F1FB' },
  { emoji: '🇨🇼', name: 'flag: Curaçao', keywords: 'curacao,flag', unicode: '1F1E8 1F1FC' },
  { emoji: '🇨🇽', name: 'flag: Christmas Island', keywords: 'christmas island,flag', unicode: '1F1E8 1F1FD' },
  { emoji: '🇨🇾', name: 'flag: Cyprus', keywords: 'cyprus,flag', unicode: '1F1E8 1F1FE' },
  { emoji: '🇨🇿', name: 'flag: Czechia', keywords: 'czechia,czech republic,flag', unicode: '1F1E8 1F1FF' },
  
  { emoji: '🇩🇪', name: 'flag: Germany', keywords: 'germany,flag', unicode: '1F1E9 1F1EA' },
  { emoji: '🇩🇬', name: 'flag: Diego Garcia', keywords: 'diego garcia,flag', unicode: '1F1E9 1F1EC' },
  { emoji: '🇩🇯', name: 'flag: Djibouti', keywords: 'djibouti,flag', unicode: '1F1E9 1F1EF' },
  { emoji: '🇩🇰', name: 'flag: Denmark', keywords: 'denmark,flag', unicode: '1F1E9 1F1F0' },
  { emoji: '🇩🇲', name: 'flag: Dominica', keywords: 'dominica,flag', unicode: '1F1E9 1F1F2' },
  { emoji: '🇩🇴', name: 'flag: Dominican Republic', keywords: 'dominican republic,flag', unicode: '1F1E9 1F1F4' },
  { emoji: '🇩🇿', name: 'flag: Algeria', keywords: 'algeria,flag', unicode: '1F1E9 1F1FF' },
  
  { emoji: '🇪🇦', name: 'flag: Ceuta & Melilla', keywords: 'ceuta,melilla,flag', unicode: '1F1EA 1F1E6' },
  { emoji: '🇪🇨', name: 'flag: Ecuador', keywords: 'ecuador,flag', unicode: '1F1EA 1F1E8' },
  { emoji: '🇪🇪', name: 'flag: Estonia', keywords: 'estonia,flag', unicode: '1F1EA 1F1EA' },
  { emoji: '🇪🇬', name: 'flag: Egypt', keywords: 'egypt,flag', unicode: '1F1EA 1F1EC' },
  { emoji: '🇪🇭', name: 'flag: Western Sahara', keywords: 'western sahara,flag', unicode: '1F1EA 1F1ED' },
  { emoji: '🇪🇷', name: 'flag: Eritrea', keywords: 'eritrea,flag', unicode: '1F1EA 1F1F7' },
  { emoji: '🇪🇸', name: 'flag: Spain', keywords: 'spain,flag', unicode: '1F1EA 1F1F8' },
  { emoji: '🇪🇹', name: 'flag: Ethiopia', keywords: 'ethiopia,flag', unicode: '1F1EA 1F1F9' },
  { emoji: '🇪🇺', name: 'flag: European Union', keywords: 'european union,eu,flag', unicode: '1F1EA 1F1FA' },
  
  { emoji: '🇫🇮', name: 'flag: Finland', keywords: 'finland,flag', unicode: '1F1EB 1F1EE' },
  { emoji: '🇫🇯', name: 'flag: Fiji', keywords: 'fiji,flag', unicode: '1F1EB 1F1EF' },
  { emoji: '🇫🇰', name: 'flag: Falkland Islands', keywords: 'falkland islands,flag', unicode: '1F1EB 1F1F0' },
  { emoji: '🇫🇲', name: 'flag: Micronesia', keywords: 'micronesia,flag', unicode: '1F1EB 1F1F2' },
  { emoji: '🇫🇴', name: 'flag: Faroe Islands', keywords: 'faroe islands,flag', unicode: '1F1EB 1F1F4' },
  { emoji: '🇫🇷', name: 'flag: France', keywords: 'france,flag', unicode: '1F1EB 1F1F7' },
  
  { emoji: '🇬🇦', name: 'flag: Gabon', keywords: 'gabon,flag', unicode: '1F1EC 1F1E6' },
  { emoji: '🇬🇧', name: 'flag: United Kingdom', keywords: 'united kingdom,britain,uk,flag', unicode: '1F1EC 1F1E7' },
  { emoji: '🇬🇩', name: 'flag: Grenada', keywords: 'grenada,flag', unicode: '1F1EC 1F1E9' },
  { emoji: '🇬🇪', name: 'flag: Georgia', keywords: 'georgia,flag', unicode: '1F1EC 1F1EA' },
  { emoji: '🇬🇫', name: 'flag: French Guiana', keywords: 'french guiana,flag', unicode: '1F1EC 1F1EB' },
  { emoji: '🇬🇬', name: 'flag: Guernsey', keywords: 'guernsey,flag', unicode: '1F1EC 1F1EC' },
  { emoji: '🇬🇭', name: 'flag: Ghana', keywords: 'ghana,flag', unicode: '1F1EC 1F1ED' },
  { emoji: '🇬🇮', name: 'flag: Gibraltar', keywords: 'gibraltar,flag', unicode: '1F1EC 1F1EE' },
  { emoji: '🇬🇱', name: 'flag: Greenland', keywords: 'greenland,flag', unicode: '1F1EC 1F1F1' },
  { emoji: '🇬🇲', name: 'flag: Gambia', keywords: 'gambia,flag', unicode: '1F1EC 1F1F2' },
  { emoji: '🇬🇳', name: 'flag: Guinea', keywords: 'guinea,flag', unicode: '1F1EC 1F1F3' },
  { emoji: '🇬🇵', name: 'flag: Guadeloupe', keywords: 'guadeloupe,flag', unicode: '1F1EC 1F1F5' },
  { emoji: '🇬🇶', name: 'flag: Equatorial Guinea', keywords: 'equatorial guinea,flag', unicode: '1F1EC 1F1F6' },
  { emoji: '🇬🇷', name: 'flag: Greece', keywords: 'greece,flag', unicode: '1F1EC 1F1F7' },
  { emoji: '🇬🇸', name: 'flag: South Georgia & South Sandwich Islands', keywords: 'south georgia,south sandwich islands,flag', unicode: '1F1EC 1F1F8' },
  { emoji: '🇬🇹', name: 'flag: Guatemala', keywords: 'guatemala,flag', unicode: '1F1EC 1F1F9' },
  { emoji: '🇬🇺', name: 'flag: Guam', keywords: 'guam,flag', unicode: '1F1EC 1F1FA' },
  { emoji: '🇬🇼', name: 'flag: Guinea-Bissau', keywords: 'guinea bissau,flag', unicode: '1F1EC 1F1FC' },
  { emoji: '🇬🇾', name: 'flag: Guyana', keywords: 'guyana,flag', unicode: '1F1EC 1F1FE' },
  
  { emoji: '🇭🇰', name: 'flag: Hong Kong SAR China', keywords: 'hong kong,flag', unicode: '1F1ED 1F1F0' },
  { emoji: '🇭🇲', name: 'flag: Heard & McDonald Islands', keywords: 'heard island,mcdonald islands,flag', unicode: '1F1ED 1F1F2' },
  { emoji: '🇭🇳', name: 'flag: Honduras', keywords: 'honduras,flag', unicode: '1F1ED 1F1F3' },
  { emoji: '🇭🇷', name: 'flag: Croatia', keywords: 'croatia,flag', unicode: '1F1ED 1F1F7' },
  { emoji: '🇭🇹', name: 'flag: Haiti', keywords: 'haiti,flag', unicode: '1F1ED 1F1F9' },
  { emoji: '🇭🇺', name: 'flag: Hungary', keywords: 'hungary,flag', unicode: '1F1ED 1F1FA' },
  
  { emoji: '🇮🇨', name: 'flag: Canary Islands', keywords: 'canary islands,flag', unicode: '1F1EE 1F1E8' },
  { emoji: '🇮🇩', name: 'flag: Indonesia', keywords: 'indonesia,flag', unicode: '1F1EE 1F1E9' },
  { emoji: '🇮🇪', name: 'flag: Ireland', keywords: 'ireland,flag', unicode: '1F1EE 1F1EA' },
  { emoji: '🇮🇱', name: 'flag: Israel', keywords: 'israel,flag', unicode: '1F1EE 1F1F1' },
  { emoji: '🇮🇲', name: 'flag: Isle of Man', keywords: 'isle of man,flag', unicode: '1F1EE 1F1F2' },
  { emoji: '🇮🇳', name: 'flag: India', keywords: 'india,flag', unicode: '1F1EE 1F1F3' },
  { emoji: '🇮🇴', name: 'flag: British Indian Ocean Territory', keywords: 'british indian ocean territory,flag', unicode: '1F1EE 1F1F4' },
  { emoji: '🇮🇶', name: 'flag: Iraq', keywords: 'iraq,flag', unicode: '1F1EE 1F1F6' },
  { emoji: '🇮🇷', name: 'flag: Iran', keywords: 'iran,flag', unicode: '1F1EE 1F1F7' },
  { emoji: '🇮🇸', name: 'flag: Iceland', keywords: 'iceland,flag', unicode: '1F1EE 1F1F8' },
  { emoji: '🇮🇹', name: 'flag: Italy', keywords: 'italy,flag', unicode: '1F1EE 1F1F9' },
  
  { emoji: '🇯🇪', name: 'flag: Jersey', keywords: 'jersey,flag', unicode: '1F1EF 1F1EA' },
  { emoji: '🇯🇲', name: 'flag: Jamaica', keywords: 'jamaica,flag', unicode: '1F1EF 1F1F2' },
  { emoji: '🇯🇴', name: 'flag: Jordan', keywords: 'jordan,flag', unicode: '1F1EF 1F1F4' },
  { emoji: '🇯🇵', name: 'flag: Japan', keywords: 'japan,flag', unicode: '1F1EF 1F1F5' },
  
  { emoji: '🇰🇪', name: 'flag: Kenya', keywords: 'kenya,flag', unicode: '1F1F0 1F1EA' },
  { emoji: '🇰🇬', name: 'flag: Kyrgyzstan', keywords: 'kyrgyzstan,flag', unicode: '1F1F0 1F1EC' },
  { emoji: '🇰🇭', name: 'flag: Cambodia', keywords: 'cambodia,flag', unicode: '1F1F0 1F1ED' },
  { emoji: '🇰🇮', name: 'flag: Kiribati', keywords: 'kiribati,flag', unicode: '1F1F0 1F1EE' },
  { emoji: '🇰🇲', name: 'flag: Comoros', keywords: 'comoros,flag', unicode: '1F1F0 1F1F2' },
  { emoji: '🇰🇳', name: 'flag: St. Kitts & Nevis', keywords: 'saint kitts,nevis,flag', unicode: '1F1F0 1F1F3' },
  { emoji: '🇰🇵', name: 'flag: North Korea', keywords: 'north korea,flag', unicode: '1F1F0 1F1F5' },
  { emoji: '🇰🇷', name: 'flag: South Korea', keywords: 'south korea,flag', unicode: '1F1F0 1F1F7' },
  { emoji: '🇰🇼', name: 'flag: Kuwait', keywords: 'kuwait,flag', unicode: '1F1F0 1F1FC' },
  { emoji: '🇰🇾', name: 'flag: Cayman Islands', keywords: 'cayman islands,flag', unicode: '1F1F0 1F1FE' },
  { emoji: '🇰🇿', name: 'flag: Kazakhstan', keywords: 'kazakhstan,flag', unicode: '1F1F0 1F1FF' },
  
  { emoji: '🇱🇦', name: 'flag: Laos', keywords: 'laos,flag', unicode: '1F1F1 1F1E6' },
  { emoji: '🇱🇧', name: 'flag: Lebanon', keywords: 'lebanon,flag', unicode: '1F1F1 1F1E7' },
  { emoji: '🇱🇨', name: 'flag: St. Lucia', keywords: 'saint lucia,flag', unicode: '1F1F1 1F1E8' },
  { emoji: '🇱🇮', name: 'flag: Liechtenstein', keywords: 'liechtenstein,flag', unicode: '1F1F1 1F1EE' },
  { emoji: '🇱🇰', name: 'flag: Sri Lanka', keywords: 'sri lanka,flag', unicode: '1F1F1 1F1F0' },
  { emoji: '🇱🇷', name: 'flag: Liberia', keywords: 'liberia,flag', unicode: '1F1F1 1F1F7' },
  { emoji: '🇱🇸', name: 'flag: Lesotho', keywords: 'lesotho,flag', unicode: '1F1F1 1F1F8' },
  { emoji: '🇱🇹', name: 'flag: Lithuania', keywords: 'lithuania,flag', unicode: '1F1F1 1F1F9' },
  { emoji: '🇱🇺', name: 'flag: Luxembourg', keywords: 'luxembourg,flag', unicode: '1F1F1 1F1FA' },
  { emoji: '🇱🇻', name: 'flag: Latvia', keywords: 'latvia,flag', unicode: '1F1F1 1F1FB' },
  { emoji: '🇱🇾', name: 'flag: Libya', keywords: 'libya,flag', unicode: '1F1F1 1F1FE' },
  
  { emoji: '🇲🇦', name: 'flag: Morocco', keywords: 'morocco,flag', unicode: '1F1F2 1F1E6' },
  { emoji: '🇲🇨', name: 'flag: Monaco', keywords: 'monaco,flag', unicode: '1F1F2 1F1E8' },
  { emoji: '🇲🇩', name: 'flag: Moldova', keywords: 'moldova,flag', unicode: '1F1F2 1F1E9' },
  { emoji: '🇲🇪', name: 'flag: Montenegro', keywords: 'montenegro,flag', unicode: '1F1F2 1F1EA' },
  { emoji: '🇲🇫', name: 'flag: St. Martin', keywords: 'saint martin,flag', unicode: '1F1F2 1F1EB' },
  { emoji: '🇲🇬', name: 'flag: Madagascar', keywords: 'madagascar,flag', unicode: '1F1F2 1F1EC' },
  { emoji: '🇲🇭', name: 'flag: Marshall Islands', keywords: 'marshall islands,flag', unicode: '1F1F2 1F1ED' },
  { emoji: '🇲🇰', name: 'flag: North Macedonia', keywords: 'north macedonia,flag', unicode: '1F1F2 1F1F0' },
  { emoji: '🇲🇱', name: 'flag: Mali', keywords: 'mali,flag', unicode: '1F1F2 1F1F1' },
  { emoji: '🇲🇲', name: 'flag: Myanmar (Burma)', keywords: 'myanmar,burma,flag', unicode: '1F1F2 1F1F2' },
  { emoji: '🇲🇳', name: 'flag: Mongolia', keywords: 'mongolia,flag', unicode: '1F1F2 1F1F3' },
  { emoji: '🇲🇴', name: 'flag: Macao SAR China', keywords: 'macao,macau,flag', unicode: '1F1F2 1F1F4' },
  { emoji: '🇲🇵', name: 'flag: Northern Mariana Islands', keywords: 'northern mariana islands,flag', unicode: '1F1F2 1F1F5' },
  { emoji: '🇲🇶', name: 'flag: Martinique', keywords: 'martinique,flag', unicode: '1F1F2 1F1F6' },
  { emoji: '🇲🇷', name: 'flag: Mauritania', keywords: 'mauritania,flag', unicode: '1F1F2 1F1F7' },
  { emoji: '🇲🇸', name: 'flag: Montserrat', keywords: 'montserrat,flag', unicode: '1F1F2 1F1F8' },
  { emoji: '🇲🇹', name: 'flag: Malta', keywords: 'malta,flag', unicode: '1F1F2 1F1F9' },
  { emoji: '🇲🇺', name: 'flag: Mauritius', keywords: 'mauritius,flag', unicode: '1F1F2 1F1FA' },
  { emoji: '🇲🇻', name: 'flag: Maldives', keywords: 'maldives,flag', unicode: '1F1F2 1F1FB' },
  { emoji: '🇲🇼', name: 'flag: Malawi', keywords: 'malawi,flag', unicode: '1F1F2 1F1FC' },
  { emoji: '🇲🇽', name: 'flag: Mexico', keywords: 'mexico,flag', unicode: '1F1F2 1F1FD' },
  { emoji: '🇲🇾', name: 'flag: Malaysia', keywords: 'malaysia,flag', unicode: '1F1F2 1F1FE' },
  { emoji: '🇲🇿', name: 'flag: Mozambique', keywords: 'mozambique,flag', unicode: '1F1F2 1F1FF' },
  
  { emoji: '🇳🇦', name: 'flag: Namibia', keywords: 'namibia,flag', unicode: '1F1F3 1F1E6' },
  { emoji: '🇳🇨', name: 'flag: New Caledonia', keywords: 'new caledonia,flag', unicode: '1F1F3 1F1E8' },
  { emoji: '🇳🇪', name: 'flag: Niger', keywords: 'niger,flag', unicode: '1F1F3 1F1EA' },
  { emoji: '🇳🇫', name: 'flag: Norfolk Island', keywords: 'norfolk island,flag', unicode: '1F1F3 1F1EB' },
  { emoji: '🇳🇬', name: 'flag: Nigeria', keywords: 'nigeria,flag', unicode: '1F1F3 1F1EC' },
  { emoji: '🇳🇮', name: 'flag: Nicaragua', keywords: 'nicaragua,flag', unicode: '1F1F3 1F1EE' },
  { emoji: '🇳🇱', name: 'flag: Netherlands', keywords: 'netherlands,flag', unicode: '1F1F3 1F1F1' },
  { emoji: '🇳🇴', name: 'flag: Norway', keywords: 'norway,flag', unicode: '1F1F3 1F1F4' },
  { emoji: '🇳🇵', name: 'flag: Nepal', keywords: 'nepal,flag', unicode: '1F1F3 1F1F5' },
  { emoji: '🇳🇷', name: 'flag: Nauru', keywords: 'nauru,flag', unicode: '1F1F3 1F1F7' },
  { emoji: '🇳🇺', name: 'flag: Niue', keywords: 'niue,flag', unicode: '1F1F3 1F1FA' },
  { emoji: '🇳🇿', name: 'flag: New Zealand', keywords: 'new zealand,flag', unicode: '1F1F3 1F1FF' },
  
  { emoji: '🇴🇲', name: 'flag: Oman', keywords: 'oman,flag', unicode: '1F1F4 1F1F2' },
  
  { emoji: '🇵🇦', name: 'flag: Panama', keywords: 'panama,flag', unicode: '1F1F5 1F1E6' },
  { emoji: '🇵🇪', name: 'flag: Peru', keywords: 'peru,flag', unicode: '1F1F5 1F1EA' },
  { emoji: '🇵🇫', name: 'flag: French Polynesia', keywords: 'french polynesia,flag', unicode: '1F1F5 1F1EB' },
  { emoji: '🇵🇬', name: 'flag: Papua New Guinea', keywords: 'papua new guinea,flag', unicode: '1F1F5 1F1EC' },
  { emoji: '🇵🇭', name: 'flag: Philippines', keywords: 'philippines,flag', unicode: '1F1F5 1F1ED' },
  { emoji: '🇵🇰', name: 'flag: Pakistan', keywords: 'pakistan,flag', unicode: '1F1F5 1F1F0' },
  { emoji: '🇵🇱', name: 'flag: Poland', keywords: 'poland,flag', unicode: '1F1F5 1F1F1' },
  { emoji: '🇵🇲', name: 'flag: St. Pierre & Miquelon', keywords: 'saint pierre,miquelon,flag', unicode: '1F1F5 1F1F2' },
  { emoji: '🇵🇳', name: 'flag: Pitcairn Islands', keywords: 'pitcairn islands,flag', unicode: '1F1F5 1F1F3' },
  { emoji: '🇵🇷', name: 'flag: Puerto Rico', keywords: 'puerto rico,flag', unicode: '1F1F5 1F1F7' },
  { emoji: '🇵🇸', name: 'flag: Palestinian Territories', keywords: 'palestine,palestinian territories,flag', unicode: '1F1F5 1F1F8' },
  { emoji: '🇵🇹', name: 'flag: Portugal', keywords: 'portugal,flag', unicode: '1F1F5 1F1F9' },
  { emoji: '🇵🇼', name: 'flag: Palau', keywords: 'palau,flag', unicode: '1F1F5 1F1FC' },
  { emoji: '🇵🇾', name: 'flag: Paraguay', keywords: 'paraguay,flag', unicode: '1F1F5 1F1FE' },
  
  { emoji: '🇶🇦', name: 'flag: Qatar', keywords: 'qatar,flag', unicode: '1F1F6 1F1E6' },
  
  { emoji: '🇷🇪', name: 'flag: Réunion', keywords: 'reunion,flag', unicode: '1F1F7 1F1EA' },
  { emoji: '🇷🇴', name: 'flag: Romania', keywords: 'romania,flag', unicode: '1F1F7 1F1F4' },
  { emoji: '🇷🇸', name: 'flag: Serbia', keywords: 'serbia,flag', unicode: '1F1F7 1F1F8' },
  { emoji: '🇷🇺', name: 'flag: Russia', keywords: 'russia,flag', unicode: '1F1F7 1F1FA' },
  { emoji: '🇷🇼', name: 'flag: Rwanda', keywords: 'rwanda,flag', unicode: '1F1F7 1F1FC' },
  
  { emoji: '🇸🇦', name: 'flag: Saudi Arabia', keywords: 'saudi arabia,flag', unicode: '1F1F8 1F1E6' },
  { emoji: '🇸🇧', name: 'flag: Solomon Islands', keywords: 'solomon islands,flag', unicode: '1F1F8 1F1E7' },
  { emoji: '🇸🇨', name: 'flag: Seychelles', keywords: 'seychelles,flag', unicode: '1F1F8 1F1E8' },
  { emoji: '🇸🇩', name: 'flag: Sudan', keywords: 'sudan,flag', unicode: '1F1F8 1F1E9' },
  { emoji: '🇸🇪', name: 'flag: Sweden', keywords: 'sweden,flag', unicode: '1F1F8 1F1EA' },
  { emoji: '🇸🇬', name: 'flag: Singapore', keywords: 'singapore,flag', unicode: '1F1F8 1F1EC' },
  { emoji: '🇸🇭', name: 'flag: St. Helena', keywords: 'saint helena,flag', unicode: '1F1F8 1F1ED' },
  { emoji: '🇸🇮', name: 'flag: Slovenia', keywords: 'slovenia,flag', unicode: '1F1F8 1F1EE' },
  { emoji: '🇸🇯', name: 'flag: Svalbard & Jan Mayen', keywords: 'svalbard,jan mayen,flag', unicode: '1F1F8 1F1EF' },
  { emoji: '🇸🇰', name: 'flag: Slovakia', keywords: 'slovakia,flag', unicode: '1F1F8 1F1F0' },
  { emoji: '🇸🇱', name: 'flag: Sierra Leone', keywords: 'sierra leone,flag', unicode: '1F1F8 1F1F1' },
  { emoji: '🇸🇲', name: 'flag: San Marino', keywords: 'san marino,flag', unicode: '1F1F8 1F1F2' },
  { emoji: '🇸🇳', name: 'flag: Senegal', keywords: 'senegal,flag', unicode: '1F1F8 1F1F3' },
  { emoji: '🇸🇴', name: 'flag: Somalia', keywords: 'somalia,flag', unicode: '1F1F8 1F1F4' },
  { emoji: '🇸🇷', name: 'flag: Suriname', keywords: 'suriname,flag', unicode: '1F1F8 1F1F7' },
  { emoji: '🇸🇸', name: 'flag: South Sudan', keywords: 'south sudan,flag', unicode: '1F1F8 1F1F8' },
  { emoji: '🇸🇹', name: 'flag: São Tomé & Príncipe', keywords: 'sao tome,principe,flag', unicode: '1F1F8 1F1F9' },
  { emoji: '🇸🇻', name: 'flag: El Salvador', keywords: 'el salvador,flag', unicode: '1F1F8 1F1FB' },
  { emoji: '🇸🇽', name: 'flag: Sint Maarten', keywords: 'sint maarten,flag', unicode: '1F1F8 1F1FD' },
  { emoji: '🇸🇾', name: 'flag: Syria', keywords: 'syria,flag', unicode: '1F1F8 1F1FE' },
  { emoji: '🇸🇿', name: 'flag: Eswatini', keywords: 'eswatini,swaziland,flag', unicode: '1F1F8 1F1FF' },
  
  { emoji: '🇹🇦', name: 'flag: Tristan da Cunha', keywords: 'tristan da cunha,flag', unicode: '1F1F9 1F1E6' },
  { emoji: '🇹🇨', name: 'flag: Turks & Caicos Islands', keywords: 'turks,caicos islands,flag', unicode: '1F1F9 1F1E8' },
  { emoji: '🇹🇩', name: 'flag: Chad', keywords: 'chad,flag', unicode: '1F1F9 1F1E9' },
  { emoji: '🇹🇫', name: 'flag: French Southern Territories', keywords: 'french southern territories,flag', unicode: '1F1F9 1F1EB' },
  { emoji: '🇹🇬', name: 'flag: Togo', keywords: 'togo,flag', unicode: '1F1F9 1F1EC' },
  { emoji: '🇹🇭', name: 'flag: Thailand', keywords: 'thailand,flag', unicode: '1F1F9 1F1ED' },
  { emoji: '🇹🇯', name: 'flag: Tajikistan', keywords: 'tajikistan,flag', unicode: '1F1F9 1F1EF' },
  { emoji: '🇹🇰', name: 'flag: Tokelau', keywords: 'tokelau,flag', unicode: '1F1F9 1F1F0' },
  { emoji: '🇹🇱', name: 'flag: Timor-Leste', keywords: 'timor leste,east timor,flag', unicode: '1F1F9 1F1F1' },
  { emoji: '🇹🇲', name: 'flag: Turkmenistan', keywords: 'turkmenistan,flag', unicode: '1F1F9 1F1F2' },
  { emoji: '🇹🇳', name: 'flag: Tunisia', keywords: 'tunisia,flag', unicode: '1F1F9 1F1F3' },
  { emoji: '🇹🇴', name: 'flag: Tonga', keywords: 'tonga,flag', unicode: '1F1F9 1F1F4' },
  { emoji: '🇹🇷', name: 'flag: Turkey', keywords: 'turkey,flag', unicode: '1F1F9 1F1F7' },
  { emoji: '🇹🇹', name: 'flag: Trinidad & Tobago', keywords: 'trinidad,tobago,flag', unicode: '1F1F9 1F1F9' },
  { emoji: '🇹🇻', name: 'flag: Tuvalu', keywords: 'tuvalu,flag', unicode: '1F1F9 1F1FB' },
  { emoji: '🇹🇼', name: 'flag: Taiwan', keywords: 'taiwan,flag', unicode: '1F1F9 1F1FC' },
  { emoji: '🇹🇿', name: 'flag: Tanzania', keywords: 'tanzania,flag', unicode: '1F1F9 1F1FF' },
  
  { emoji: '🇺🇦', name: 'flag: Ukraine', keywords: 'ukraine,flag', unicode: '1F1FA 1F1E6' },
  { emoji: '🇺🇬', name: 'flag: Uganda', keywords: 'uganda,flag', unicode: '1F1FA 1F1EC' },
  { emoji: '🇺🇲', name: 'flag: U.S. Outlying Islands', keywords: 'us outlying islands,flag', unicode: '1F1FA 1F1F2' },
  { emoji: '🇺🇳', name: 'flag: United Nations', keywords: 'united nations,un,flag', unicode: '1F1FA 1F1F3' },
  { emoji: '🇺🇸', name: 'flag: United States', keywords: 'united states,america,usa,flag', unicode: '1F1FA 1F1F8' },
  { emoji: '🇺🇾', name: 'flag: Uruguay', keywords: 'uruguay,flag', unicode: '1F1FA 1F1FE' },
  { emoji: '🇺🇿', name: 'flag: Uzbekistan', keywords: 'uzbekistan,flag', unicode: '1F1FA 1F1FF' },
  
  { emoji: '🇻🇦', name: 'flag: Vatican City', keywords: 'vatican city,flag', unicode: '1F1FB 1F1E6' },
  { emoji: '🇻🇨', name: 'flag: St. Vincent & Grenadines', keywords: 'saint vincent,grenadines,flag', unicode: '1F1FB 1F1E8' },
  { emoji: '🇻🇪', name: 'flag: Venezuela', keywords: 'venezuela,flag', unicode: '1F1FB 1F1EA' },
  { emoji: '🇻🇬', name: 'flag: British Virgin Islands', keywords: 'british virgin islands,flag', unicode: '1F1FB 1F1EC' },
  { emoji: '🇻🇮', name: 'flag: U.S. Virgin Islands', keywords: 'us virgin islands,flag', unicode: '1F1FB 1F1EE' },
  { emoji: '🇻🇳', name: 'flag: Vietnam', keywords: 'vietnam,flag', unicode: '1F1FB 1F1F3' },
  { emoji: '🇻🇺', name: 'flag: Vanuatu', keywords: 'vanuatu,flag', unicode: '1F1FB 1F1FA' },
  
  { emoji: '🇼🇫', name: 'flag: Wallis & Futuna', keywords: 'wallis,futuna,flag', unicode: '1F1FC 1F1EB' },
  { emoji: '🇼🇸', name: 'flag: Samoa', keywords: 'samoa,flag', unicode: '1F1FC 1F1F8' },
  
  { emoji: '🇽🇰', name: 'flag: Kosovo', keywords: 'kosovo,flag', unicode: '1F1FD 1F1F0' },
  
  { emoji: '🇾🇪', name: 'flag: Yemen', keywords: 'yemen,flag', unicode: '1F1FE 1F1EA' },
  { emoji: '🇾🇹', name: 'flag: Mayotte', keywords: 'mayotte,flag', unicode: '1F1FE 1F1F9' },
  
  { emoji: '🇿🇦', name: 'flag: South Africa', keywords: 'south africa,flag', unicode: '1F1FF 1F1E6' },
  { emoji: '🇿🇲', name: 'flag: Zambia', keywords: 'zambia,flag', unicode: '1F1FF 1F1F2' },
  { emoji: '🇿🇼', name: 'flag: Zimbabwe', keywords: 'zimbabwe,flag', unicode: '1F1FF 1F1FC' }
];

async function addAllFlags() {
  console.log('🏁 Adding ALL flag emojis to the database...');
  console.log(`📊 Processing ${allFlags.length} flag emojis in batches...`);
  
  try {
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const batchSize = 10; // Process in smaller batches to avoid timeouts
    
    // Check if flags already exist to avoid re-processing
    const existingFlagsCount = await sql`SELECT COUNT(*) as total FROM emojis WHERE category = 'Flags'`;
    if (existingFlagsCount.rows[0].total >= 200) {
      console.log(`✅ Flags category already has ${existingFlagsCount.rows[0].total} emojis - skipping bulk import`);
      return;
    }
    
    for (let i = 0; i < allFlags.length; i += batchSize) {
      const batch = allFlags.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allFlags.length/batchSize)} (${batch.length} flags)`);
      
      for (const flag of batch) {
        try {
          // Check if emoji already exists
          const existing = await sql`
            SELECT id, category FROM emojis WHERE emoji = ${flag.emoji} LIMIT 1
          `;
          
          if (existing.rows.length === 0) {
            // Add new flag emoji
            await sql`
              INSERT INTO emojis (
                emoji, name, keywords, category, subcategory, 
                unicode, unicode_version, status, emoji_type, 
                base_unicode, has_variations, skin_tone, hair_style
              ) VALUES (
                ${flag.emoji}, ${flag.name}, ${flag.keywords}, 'Flags', 'flag',
                ${flag.unicode}, '1.0', 'fully-qualified', 'standard',
                ${flag.unicode}, false, '', ''
              )
            `;
            
            added++;
          } else if (existing.rows[0].category !== 'Flags') {
            // Update existing emoji to Flags category
            await sql`
              UPDATE emojis 
              SET category = 'Flags', subcategory = 'flag'
              WHERE emoji = ${flag.emoji}
            `;
            
            updated++;
          } else {
            skipped++;
          }
        } catch (flagError) {
          console.warn(`⚠️  Error processing ${flag.emoji} ${flag.name}:`, flagError.message);
          // Continue with next flag instead of failing entirely
        }
      }
      
      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < allFlags.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Verify the changes
    const flagsCount = await sql`SELECT COUNT(*) as total FROM emojis WHERE category = 'Flags'`;
    console.log(`🏁 Total emojis in Flags category: ${flagsCount.rows[0].total}`);
    console.log(`✅ Added ${added} new flag emojis!`);
    console.log(`🔄 Updated ${updated} existing flag emojis!`);
    console.log(`⏭️  Skipped ${skipped} existing flag emojis!`);
    
  } catch (error) {
    console.error('❌ Error adding flags:', error);
    // Don't exit with error code - let build continue
    console.log('⚠️  Continuing build despite flags import issues...');
  }
}

// Run if called directly
if (require.main === module) {
  addAllFlags().catch(console.error);
}

module.exports = { addAllFlags };