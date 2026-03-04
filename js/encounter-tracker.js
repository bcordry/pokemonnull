// ENCOUNTER TRACKER WITH KO TRACKING AND POKÉMON IMAGE AXIS LABELS

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    initializeEncounterTracker();
});

function initializeGraphToggle() {
    const koStatsSection = document.getElementById('koStatsSection');
    const toggleBtn = document.getElementById('toggleGraphBtn');
    const chartContainer = koStatsSection.querySelector('.chart-container');
    const statsTitle = koStatsSection.querySelector('.stats-title');
    if (!toggleBtn || !chartContainer || !statsTitle) return;

    toggleBtn.addEventListener('click', function() {
        const isHidden = chartContainer.style.display === 'none';
        chartContainer.style.display = isHidden ? '' : 'none';
        statsTitle.style.display = isHidden ? '' : 'none';
        toggleBtn.textContent = isHidden ? 'Hide Graph' : 'Show Graph';
    });
}

// Global variables for chart and data management
let koChart = null;
let encounterData = {};
let koData = {};
let pokemonImageCache = {}; // Cache for loaded images

// ────
// SORT STATE
// Tracks which sort mode is currently active.
// 'game'  → original insertion order (default)
// 'alpha' → A–Z by location name
// ────
let currentSort = 'game';

// ────
// LOCATION ENCOUNTER DATA
// Each key is a location name (normalized: floors use "1F", "2F", "B1F", etc.)
// Each value is an array of Pokémon name strings available at that location.
// Order matches the encounters.json file exactly — no alphabetizing.
// The "Starter" entry is manually added first with the three starter choices.
// ────
const locationEncounters = {
    // ── Special: Starter selection ────
    "Starter": ["Fennekin", "Froakie", "Chespin"],

    // ── Routes ────
    "Littleroot Town": ["Barboach","Bulbasaur","Charmander","Chikorita","Cyndaquil","Growlithe","Mudkip","Oshawott","Piplup","Poliwag","Popplio","Shellos","Snivy","Sobble","Squirtle","Tangela","Tepig","Totodile","Tympole","Wooper"],
    "Littleroot Grove": ["Gossifleur","Gulpin","Minior-Core-Blue","Minior-Core-Green","Morpeko","Quaxly","Rolycoly","Sandshrew-Alolan","Slugma","Spheal","Toedscool"],
    "Route 101": ["Aipom","Bidoof","Bunnelby","Helioptile","Litleo","Pidgey","Smoliv","Stantler","Wooloo","Zigzagoon-Galarian"],
    "Oldale Town": ["Capsakid","Charcadet","Darumaka","Fletchling","Growlithe","Growlithe-Hisuian","Houndour","Litleo","Numel","Salandit","Sizzlipede"],
    "Oldale Grove": ["Ekans","Electrike","Lillipup","Maschiff","Oddish","Roggenrola","Scraggy","Shinx","Snubbull","Stantler","Surskit"],
    "Route 103": ["Applin","Arctovish","Arctozolt","Avalugg","Avalugg-Hisuian","Budew","Capsakid","Exeggcute","Gossifleur","Lapras","Lotad","Ludicolo","Morelull","Seel","Sewaddle","Shellder","Shroomish","Smoliv","Sneasel","Spheal","Tangela"],
    "Verdanturf Tunnel": ["Aron","Bergmite","Binacle","Boldore","Carbink","Cranidos","Dwebble","Geodude","Geodude-Alolan","Glimmet","Klawf","Lairon","Larvitar","Nacli","Naclstack","Nosepass","Onix","Orthworm","Rhydon","Rhyhorn","Rockruff","Roggenrola","Rolycoly"],
    "Route 102": ["Ducklett","Finneon","Fletchling","Mantyke","Minior","Natu","Noibat","Piplup","Quaxly","Rookidee","Squirtle","Starly","Surskit","Swablu","Wattrel","Zubat"],
    "Route 102 Grove": ["Croagunk","Nidoran-F","Nidoran-M","Roselia","Salandit","Shroodle","Skorupi","Slowpoke-Galarian","Stunky","Wooper-Paldean","Zubat"],
    "Petalburg City": ["Bombirdier","Croagunk","Dewpider","Dondozo","Finizen","Houndour","Inkay","Magikarp","Marill","Maschiff","Meowth-Alolan","Morpeko","Murkrow","Nymble","Purrloin","Qwilfish","Seedot","Slowpoke","Squirtle","Tatsugiri"],
    "Petalburg Grove": ["Blitzle","Electrike","Elekid","Helioptile","Mareep","Pichu","Shinx","Tadbulb","Tynamo","Yamper"],
    "Route 104": ["Araquanid","Beedrill","Blipbug","Butterfree","Clauncher","Combee","Cutiefly","Dewpider","Grubbin","Nincada","Ribombee","Scyther","Sewaddle","Sizzlipede","Skrelp","Snom","Surskit","Tentacool","Venipede","Yanma","Yanmega"],
    "Petalburg Woods": ["Bellsprout","Bulbasaur","Capsakid","Exeggcute","Oddish","Petilil","Tangela"],
    "Rustboro City": ["Crabrawler","Falinks","Makuhita","Mankey","Mienfoo","Stufful","Tauros-Paldean","Tauros-Paldean-Aqua-Breed","Tauros-Paldean-Blaze-Breed","Timburr","Tyrogue"],
    "Rustboro Grove": ["Espurr","Glameow","Litten","Luxio","Meowth","Meowth-Alolan","Meowth-Galarian","Pikachu","Skitty"],
    "Route 115": ["Anorith","Cloyster","Emboar","Farigiraf","Feraligatr","Finizen","Gallade","Gyarados","Heracross","Kabuto","Lapras","Lileep","Meganium","Omanyte","Relicanth","Roserade","Slowbro","Ursaring","Victreebel","Zebstrika"],
    "Route 116": ["Charcadet","Charmander","Combee","Fletchling","Foongus","Gligar","Koffing","Morelull","Nidoran-F","Nidoran-M","Sizzlipede"],
    "Rusturf Tunnel": ["Applin","Axew","Cyclizar","Drampa","Druddigon","Noibat","Swablu","Turtonator"],
    "Dewford Town": ["Abra","Armarouge","Bruxish","Calyrex","Chingling","Dottler","Flittle","Meditite","Natu","Ponyta-Galarian","Ralts","Slowbro","Slowbro-Galarian","Slowking","Slowking-Galarian","Slowpoke","Slowpoke-Galarian","Solosis","Starmie","Veluza"],
    "Route 107": ["Arrokuda","Carvanha","Clodsire","Corphish","Corsola","Corsola-Galarian","Krabby","Mareanie","Quagsire","Shellder","Staryu","Tympole"],
    "Route 106": ["Arrokuda","Buizel","Clamperl","Dondozo","Dratini","Goomy","Gyarados","Lapras","Lotad","Mantyke","Poliwag","Tatsugiri"],
    "Granite Cave": ["Amaura","Aron","Azurill","Bergmite","Binacle","Bronzor","Cetoddle","Cleffa","Cottonee","Crabrawler","Cubone","Cufant","Eiscue","Fidough","Flabebe","Gligar","Hippopotas","Klefki","Mawile","Meowth-Galarian","Milcery","Mime-Jr","Mudbray","Nosepass","Numel","Onix","Orthworm","Phanpy","Ponyta-Galarian","Rhyhorn","Sandile","Sandshrew-Alolan","Sneasel","Snom","Snorunt","Snover","Snubbull","Swinub","Tinkatink","Trapinch","Varoom","Vulpix-Alolan"],
    "Route 109": ["Clawitzer","Dracovish","Drampa","Dratini","Goomy","Horsea","Seadra","Swablu","Tatsugiri"],
    "Slateport City": ["Clamperl","Clodsire","Cubone","Dondozo","Feebas","Gligar","Hippopotas","Luvdisc","Magikarp","Mudbray","Nidoran-F","Nidoran-M","Numel","Phanpy","Pyukumuku","Quagsire","Remoraid","Swinub","Trapinch"],
    "Route 110": ["Chewtle","Chinchou","Corphish","Corvisquire","Cutiefly","Fletchinder","Floette","Houndour","Karrablast","Klefki","Marill","Morpeko","Murkrow","Poliwhirl","Popplio","Scraggy","Shelmet","Stunky","Tinkatuff","Togedemaru","Whiscash"],
    "Icefall Cave": ["Arctovish","Arctozolt","Cetoddle","Cubchoo","Frosmoth","Sandshrew-Alolan","Snorunt","Snover","Swinub"],
    "Verdanturf Town": ["Cottonee","Nymble","Pidgey","Snover","Tinkatuff","Toedscool","Turtwig","Zigzagoon-Galarian"],
    "Route 117": ["Beedrill","Butterfree","Dartrix","Dolliv","Eldegoss","Feebas","Gloom","Grimer-Alolan","Grotle","Growlithe","Growlithe-Hisuian","Lokix","Lombre","Masquerain","Petilil","Piplup","Quaxwell","Stunfisk","Stunfisk-Galarian","Swadloon","Yanmega"],
    "Mauville City": ["Dracozolt","Graveler-Alolan","Joltik","Kilowattrel","Manectric","Morpeko","Pawmi","Pikachu","Togedemaru","Toxel"],
    "Route 118": ["Amoonguss","Araquanid","Barraskewda","Beedrill","Blastoise","Breloom","Butterfree","Chinchou","Ferroseed","Finizen","Kangaskhan","Ludicolo","Magikarp","Manectric","Pinsir","Skrelp","Tentacruel","Toxapex","Treecko","Victreebel","Wimpod"],
    "Route 111": ["Bellibolt","Bramblin","Chinchou","Coalossal","Darmanitan","Drilbur","Eelektrik","Gastrodon","Gligar","Grimer-Alolan","Herdier","Hippopotas","Kleavor","Krokorok","Lycanroc-Dusk","Palpitoad","Poliwhirl","Rhydon","Scrafty","Skarmory","Stunfisk","Stunfisk-Galarian","Swampert","Vullaby","Whiscash"],
    "Trainer Hill": ["Eevee"],
    "Terra Cave": ["Amaura","Arcanine-Hisuian","Aron","Boldore","Camerupt","Carkol","Charcadet","Charmeleon","Cranidos","Cubone","Magby","Quilava","Rhydon","Rockruff","Shieldon","Torkoal","Torracat","Turtonator","Tyrunt"],
    "Altering Cave": ["Bronzor","Chimecho","Crobat","Golbat","Magnemite","Nosepass","Pawniard","Perrserker","Riolu","Stufful","Tinkaton","Togedemaru"],
    "Altering Grove": ["Audino","Azumarill","Bibarel","Dewgong","Diggersby","Dolliv","Dunsparce","Girafarig","Heliolisk","Kangaskhan","Linoone-Galarian","Munchlax","Porygon","Stoutland","Stufful","Swanna","Tauros","Togepi","Wyrdeer"],
    "Verdanturf Grotto": ["Aerodactyl","Amaura","Archen","Arctovish","Arctozolt","Armaldo","Carbink","Carracosta","Cradily","Cranidos","Diancie","Dracovish","Dracozolt","Glimmet","Kabutops","Omastar","Relicanth","Shieldon","Shuckle","Tyrunt"],
    "Mirage Tower": ["Absol","Altaria","Axew","Baltoy","Beldum","Charcadet","Clefairy","Cubone","Drapion","Drilbur","Duosion","Duskull","Espathra","Golurk","Granbull","Greavard","Hatenna","Hippopotas","Impidimp","Kadabra","Krookodile","Lairon","Lunatone","Mawile","Mesprit","Misdreavus","Onix","Ralts","Sableye","Sandshrew","Sandygast","Shuppet","Sigilyph","Sinistea","Solrock","Spiritomb","Vibrava","Whirlipede","Yamask","Yamask-Galarian","Zorua-Hisuian","Zygarde-10"],
    "Route 113": ["Absol","Bisharp","Bombirdier","Houndoom","Morgrem","Murkrow","Nuzleaf","Scrafty","Skorupi","Sprigatito","Zorua","Zorua-Hisuian"],
    "Fallarbor Town": ["Durant","Grookey","Heatmor","Karrablast","Rufflet","Scorbunny","Shelmet","Sobble","Spinda","Stonjourner","Vullaby"],
    "Route 114": ["Araquanid","Armaldo","Caterpie","Crustle","Feebas","Galvantula","Heracross","Karrablast","Kleavor","Leavanny","Lokix","Magikarp","Marill","Masquerain","Pineco","Pinsir","Ribombee","Scyther","Shuckle","Slowpoke","Surskit","Weedle","Whirlipede","Yanmega"],
    "Meteor Falls": ["Aerodactyl","Arcanine-Hisuian","Armaldo","Bagon","Baxcalibur","Bronzong","Buzzwole","Carbink","Celesteela","Chandelure","Clefable","Clodsire","Corsola-Galarian","Cradily","Darmanitan-Galarian","Dewgong","Diancie","Dondozo","Dragapult","Dragonite","Flutter-Mane","Flygon","Garchomp","Gastrodon","Gigalith","Glimmora","Goodra","Goodra-Hisuian","Great-Tusk","Gyarados","Hydreigon","Incineroar","Iron-Bundle","Iron-Jugulis","Iron-Thorns","Iron-Treads","Iron-Valiant","Kabutops","Kartana","Kingambit","Krookodile","Lapras","Lopunny","Lucario","Lunatone","Mawile","Metagross","Milotic","Minior-Core-Indigo","Minior-Core-Orange","Minior-Core-Red","Minior-Core-Violet","Minior-Core-Yellow","Naganadel","Noivern","Omastar","Pheromosa","Quagsire","Qwilfish","Qwilfish-Hisuian","Roaring-Moon","Rotom","Salamence","Scrafty","Scream-Tail","Solrock","Stakataka","Stoutland","Tatsugiri","Tatsugiri-Droopy","Tatsugiri-Stretchy","Tyranitar","Walking-Wake","Walrein","Weavile"],
    "Route 112": ["Arcanine","Arcanine-Hisuian","Camerupt","Chimecho","Fraxure","Hitmontop","Marill","Rockruff","Scovillain","Vibrava"],
    "Fiery Path": ["Camerupt","Chimchar","Coalossal","Fuecoco","Scorbunny","Torchic","Torkoal","Turtonator"],
    "Mt Chimney": ["Camerupt","Gliscor","Hakamo-O","Lycanroc-Dusk","Minior-Core-Indigo","Minior-Core-Orange","Pupitar","Scolipede","Typhlosion","Typhlosion-Hisuian","Weezing-Galarian"],
    "Jagged Pass": ["Bombirdier","Clefable","Garganacl","Gigalith","Gliscor","Gurdurr","Jangmo-O","Revavroom","Runerigus","Stonjourner","Vibrava"],
    "Route 134": ["Aerodactyl","Azumarill","Barraskewda","Basculegion","Basculegion-Female","Floatzel","Honchkrow","Milotic","Noivern","Sharpedo","Togekiss"],
    "New Mauville": ["Ampharos","Boltund","Charjabug","Electabuzz","Magneton","Metang","Probopass","Rotom","Togedemaru","Golem-Alolan","Heliolisk","Morpeko","Pawmo","Toxtricity","Toxtricity-Low-Key","Tyranitar"],
    "Route 105": ["Alakazam","Bibarel","Blaziken","Corviknight","Dipplin","Dracovish","Dragalge","Emboar","Gallade","Hawlucha","Kilowattrel","Lanturn","Magneton","Mantine","Pawmot","Poliwrath","Starmie"],
    "Route 108": ["Arrokuda","Binacle","Buizel","Carvanha","Chewtle","Corphish","Mareanie","Oshawott","Squirtle","Tentacool"],
    "Abandoned Ship": ["Araquanid","Banette","Basculin","Cursola","Dhelmise","Dragalge","Drakloak","Drifloon","Frillish","Gastly","Gengar","Jellicent","Palafin","Poltchageist","Polteageist","Sableye","Skrelp"],
    "Route 119": ["Bellibolt","Castform","Clawitzer","Dragonair","Enamorus","Goomy","Landorus","Lumineon","Octillery","Quaquaval","Samurott","Samurott-Hisuian","Tapu-Bulu","Tapu-Koko","Thundurus","Tornadus"],
    "Fortree City": ["Altaria","Corviknight","Gliscor","Hawlucha","Honchkrow","Kilowattrel","Scyther","Shiftry","Staraptor","Talonflame","Togetic"],
    "Route 120": ["Arboliva","Dipplin","Dragalge","Eldegoss","Electrode-Hisuian","Ferrothorn","Gyarados","Kecleon","Ludicolo","Milotic","Rillaboom","Roserade","Sceptile","Sinistcha","Slowbro","Slowbro-Galarian","Slowking","Slowking-Galarian","Tangrowth","Tentacruel","Toxapex"],
    "Route 121": ["Annihilape","Araquanid","Gardevoir","Glimmora","Hydrapple","Kangaskhan","Kilowattrel","Kingambit","Mamoswine","Volcarona"],
    "Lilycove City": ["Alcremie","Altaria","Araquanid","Arboliva","Azumarill","Bruxish","Cyclizar","Dragonite","Empoleon","Ferrothorn","Florges","Kingdra","Klefki","Mawile","Meganium","Milotic","Primarina","Shiinotic","Tapu-Bulu","Tapu-Fini","Tatsugiri","Whimsicott"],
    "Aqua Hideout": ["Basculegion","Basculegion-Female","Corsola-Galarian","Crawdaunt","Dragalge","Muk-Alolan","Overqwil","Sharpedo","Tentacruel","Toxapex"],
    "Battle Frontier": ["Ambipom","Bibarel","Delcatty","Diggersby","Dubwool","Dudunsparce","Dudunsparce-Three-Segment","Persian","Purugly","Snorlax","Spinda","Tauros"],
    "Artisan Cave": ["Arboliva","Audino","Bewear","Buneary","Chansey","Cyclizar","Diggersby","Eevee","Grafaiai","Happiny","Kangaskhan","Obstagoon","Porygon","Pyroar","Teddiursa","Wyrdeer","Zigzagoon-Galarian"],
    "Southern Island": ["Bagon","Deino","Dratini","Dreepy","Duraludon","Frigibax","Gible","Goomy","Jangmo-O","Latias","Latios","Swablu","Buneary","Chimchar","Hawlucha","Mankey","Meditite","Pawmo","Riolu","Sneasel-Hisuian","Terrakion","Timburr","Torchic"],
    "Route 122": ["Basculegion","Basculegion-Female","Corsola-Galarian","Cursola","Drifblim","Flittle","Gengar","Jellicent","Mandibuzz","Mismagius","Weezing-Galarian"],
    "Route 123": ["Aerodactyl","Archaludon","Archeops","Bronzong","Corsola-Galarian","Drampa","Druddigon","Forretress","Garchomp","Gyarados","Hawlucha","Haxorus","Liepard","Milotic","Ninjask","Noivern","Palafin","Perrserker","Scrafty","Toxapex","Veluza","Volcarona"],
    "Mt Pyre": ["Alakazam","Armarouge","Bronzong","Deino","Dreepy","Dusclops","Gallade","Gardevoir","Hatterene","Malamar","Medicham","Metagross","Pumpkaboo","Pumpkaboo-Large","Pumpkaboo-Small","Rotom","Spiritomb","Uxie"],
    "Magma Hideout": ["Aerodactyl","Aggron","Armarouge","Baxcalibur","Blaziken","Ceruledge","Chandelure","Charizard","Cinderace","Cobalion","Dachsbun","Darmanitan","Darmanitan-Galarian","Dragonite","Garchomp","Garganacl","Glimmora","Hydreigon","Infernape","Lopunny","Magcargo","Marowak","Marowak-Alolan","Mimikyu","Rhyperior","Salamence","Skeledirge","Sneasler","Tauros-Paldean-Blaze-Breed","Terrakion","Typhlosion","Typhlosion-Hisuian","Ursaluna","Ursaluna-Bloodmoon","Ursaring","Virizion"],
    "Route 124": ["Carracosta","Dondozo","Dragalge","Lanturn","Relicanth","Wailord","Araquanid","Barraskewda","Gyarados","Honchkrow","Milotic","Qwilfish","Qwilfish-Hisuian","Samurott","Samurott-Hisuian","Sharpedo"],
    "Mossdeep City": ["Articuno-Galarian","Braviary-Hisuian","Bruxish","Claydol","Cresselia","Sigilyph","Slowbro","Slowking","Starmie","Veluza","Xatu"],
    "Route 125": ["Avalugg","Barbaracle","Cloyster","Dewgong","Drednaw","Eiscue","Inteleon","Lapras","Samurott","Walrein","Weavile"],
    "Shoal Cave": ["Abomasnow","Aggron","Altaria","Araquanid","Barbaracle","Baxcalibur","Blastoise","Clefable","Clodsire","Cloyster","Crabominable","Crawdaunt","Crustle","Cursola","Darmanitan-Galarian","Dewgong","Drednaw","Empoleon","Escavalier","Floatzel","Froslass","Frosmoth","Garganacl","Glalie","Golurk","Goodra","Goodra-Hisuian","Grimmsnarl","Kangaskhan","Kingambit","Kingler","Lanturn","Lopunny","Mamoswine","Medicham","Nidoking","Nidoqueen","Ninetales-Alolan","Omastar","Overqwil","Perrserker","Politoed","Poliwrath","Quagsire","Quaquaval","Qwilfish","Samurott","Samurott-Hisuian","Slowbro","Slowbro-Galarian","Slowking","Slowking-Galarian","Sneasler","Stonjourner","Tentacruel","Tinkaton","Toxapex","Walrein","Weavile"],
    "Route 127": ["Dondozo","Gorebyss","Gyarados","Heracross","Huntail","Lopunny","Magnezone","Milotic","Pyukumuku","Revavroom","Salazzle","Sinistcha","Staraptor","Swanna","Tauros-Paldean-Aqua-Breed","Venusaur","Vikavolt","Volcarona","Zoroark"],
    "Route 126": ["Carracosta","Dondozo","Gorebyss","Huntail","Lanturn","Relicanth","Barbaracle","Barraskewda","Drednaw","Feraligatr","Kingdra","Kingler","Ludicolo","Mantine","Politoed","Poliwrath","Seismitoad"],
    "Sootopolis City": ["Vaporeon"],
    "Route 128": ["Vaporeon"],
    "Seafloor Cavern": ["Aggron","Archeops","Barbaracle","Clodsire","Cradily","Crobat","Drampa","Duraludon","Durant","Excadrill","Falinks","Goodra","Heliolisk","Kabutops","Mienshao","Palossand","Quaquaval","Rhyperior","Starmie"],
    "Cave Of Origin": ["Audino","Azelf","Carbink","Claydol","Diancie","Flygon","Glimmora","Golem","Grimmsnarl","Hariyama","Hatterene","Mawile","Probopass","Rapidash-Galarian","Sableye","Ursaring"],
    "Route 131": ["Aerodactyl","Bibarel","Clawitzer","Golisopod","Goodra-Hisuian","Lumineon","Luvdisc","Octillery","Palafin","Primarina","Slowbro","Toxapex"],
    "Pacifidlog Town": ["Corsola","Corsola-Galarian","Dreepy","Drifloon","Duskull","Frillish","Froslass","Haunter","Mareanie","Mismagius","Sableye","Shuppet"],
    "Sky Pillar": ["Arcanine","Archaludon","Banette","Centiskorch","Ceruledge","Cetitan","Darmanitan-Galarian","Dragonite","Frosmoth","Gliscor","Kleavor","Mamoswine","Metagross","Orbeetle","Sableye","Salamence","Skeledirge","Sneasler","Tyranitar","Volcarona","Aegislash","Aerodactyl","Altaria","Crobat","Cyclizar","Dragapult","Excadrill","Flygon","Gholdengo","Goodra-Hisuian","Honchkrow","Krookodile","Lucario","Lunatone","Meowscarada","Mimikyu","Rhyperior","Scizor","Solrock","Togekiss","Ursaluna","Ursaluna-Bloodmoon","Weavile","Weezing-Galarian","Zoroark","Zoroark-Hisuian"],
    "Ever Grande City": ["Altaria","Barraskewda","Blaziken","Cloyster","Corviknight","Dewgong","Empoleon","Ferrothorn","Floatzel","Florges","Gyarados","Hydrapple","Infernape","Kingdra","Pidgeot","Sceptile","Seismitoad","Swampert","Togekiss","Torterra","Whiscash"],
    "Navel Rock": ["Alcremie","Altaria","Ambipom","Amoonguss","Armaldo","Audino","Avalugg","Avalugg-Hisuian","Banette","Bastiodon","Bisharp","Blastoise","Bombirdier","Bronzong","Carbink","Cinderace","Clefable","Coalossal","Cofagrigus","Corviknight","Cradily","Crobat","Crustle","Cyclizar","Dachsbun","Diggersby","Donphan","Drapion","Druddigon","Escavalier","Espathra","Excadrill","Falinks","Flygon","Forretress","Garganacl","Geodude","Geodude-Alolan","Gliscor","Golem","Golem-Alolan","Grafaiai","Grimmsnarl","Hariyama","Hatterene","Hawlucha","Hitmonchan","Hitmonlee","Hitmontop","Honchkrow","Hydrapple","Infernape","Klawf","Kleavor","Klefki","Liepard","Lokix","Lucario","Lycanroc-Dusk","Lycanroc-Midnight","Magnezone","Mawile","Meganium","Meowstic","Meowstic-Female","Mienshao","Minior-Core-Red","Mr-Mime","Mr-Mime-Galarian","Nacli","Obstagoon","Orbeetle","Palossand","Perrserker","Persian-Alolan","Porygon2","Primarina","Probopass","Pupitar","Raichu","Raichu-Alolan","Reuniclus","Rhyhorn","Roggenrola","Rolycoly","Sableye","Salazzle","Samurott","Samurott-Hisuian","Scizor","Scrafty","Shiftry","Shiinotic","Shuckle","Sinistcha","Sliggoo-Hisuian","Spiritomb","Steelix","Stonjourner","Swalot","Toedscruel","Togekiss","Torkoal","Torterra","Turtonator","Volcarona","Whimsicott","Wyrdeer","Yanmega"],
    "Safari Zone": ["Articuno","Articuno-Galarian","Azelf","Celebi","Chi-Yu","Chien-Pao","Cobalion","Cresselia","Darkrai","Diancie","Entei","Fezandipiti","Genesect","Glastrier","Heatran","Hoopa","Jirachi","Keldeo","Kubfu","Magearna","Manaphy","Marshadow","Meloetta","Meltan","Mesprit","Mew","Moltres","Moltres-Galarian","Munkidori","Ogerpon-Teal-Mask","Okidogi","Pecharunt","Phione","Raikou","Regice","Regidrago","Regieleki","Regigigas","Regirock","Registeel","Shaymin","Spectrier","Suicune","Tapu-Bulu","Tapu-Fini","Tapu-Koko","Tapu-Lele","Terrakion","Ting-Lu","Uxie","Victini","Virizion","Volcanion","Wo-Chien","Zapdos","Zapdos-Galarian","Zarude","Zeraora","Zygarde-10"],
    "Desert Underpass": ["Aggron","Beartic","Claydol","Copperajah","Drapion","Golem","Gurdurr","Marowak","Polteageist","Serperior","Skarmory","Steelix"],
    "Victory Road": ["Absol","Aegislash","Aerodactyl","Altaria","Beedrill","Blastoise","Blaziken","Chandelure","Charizard","Cinderace","Crawdaunt","Darmanitan","Darmanitan-Galarian","Diancie","Dragapult","Dragonite","Excadrill","Gallade","Garchomp","Gardevoir","Gholdengo","Glimmora","Gliscor","Goodra-Hisuian","Heracross","Honchkrow","Hydreigon","Infernape","Kecleon","Kleavor","Lanturn","Lopunny","Lucario","Mamoswine","Mawile","Meowscarada","Metagross","Mimikyu","Pinsir","Poliwrath","Salamence","Scizor","Sneasler","Tinkaton","Tyranitar","Ursaluna","Ursaluna-Bloodmoon","Walrein","Weavile"],



};

// ────
// LOCATIONS LIST
// Derived from the keys of locationEncounters so order is always preserved.
// Object.keys() in modern JS preserves insertion order for string keys.
// ────
const locations = Object.keys(locationEncounters);

// ────
// POKEMON NAME → POKEAPI ID LOOKUP
// Used to fetch sprites. Names are lowercased for matching.
// Pokémon not in this map will still appear in dropdowns but won't show a sprite.
// ────
const pokemonIdMap = {
    "absol":1359,"aegislash":681,"aerodactyl":142,"aggron":306,"aipom":190,
    "alakazam":65,"alcremie":869,"altaria":334,"amaura":698,"ambipom":424,
    "amoonguss":591,"annihilape":1065,"anorith":347,"applin":840,"araquanid":752,
    "arboliva":1009,"arcanine":59,"arcanine-hisuian":59,"archaludon":1018,
    "archen":566,"archeops":567,"arctovish":883,"arctozolt":881,"aron":304,
    "armaldo":348,"armarouge":936,"arrokuda":846,"articuno":144,"audino":531,
    "avalugg":713,"avalugg-hisuian":713,"axew":610,"azelf":482,"azumarill":184,
    "azurill":298,"bagon":371,"baltoy":343,"banette":354,"barbaracle":689,
    "barboach":339,"barraskewda":847,"basculegion":902,"basculegion-female":902,
    "basculin":550,"bastiodon":411,"baxcalibur":998,"beartic":614,"beedrill":15,
    "beldum":374,"bellibolt":939,"bellsprout":69,"bergmite":712,"bewear":760,
    "bibarel":400,"bidoof":399,"binacle":688,"bisharp":625,"blastoise":9,
    "blaziken":257,"blipbug":824,"blitzle":522,"boldore":525,"boltund":836,
    "bombirdier":962,"bramblin":1005,"brambleghast":1006,"breloom":286,
    "bronzong":437,"bronzor":436,"bruxish":779,"budew":406,"buizel":418,"bulbasaur":1,
    "buneary":427,"bunnelby":659,"butterfree":12,"buzzwole":794,"capsakid":951,
    "carbink":703,"camerupt":323,"carkol":838,"carracosta":565,"carvanha":318,
    "castform":351,"caterpie":10,"celesteela":797,"centiskorch":851,
    "ceruledge":937,"cetitan":975,"cetoddle":974,"chandelure":609,"chansey":113,
    "charcadet":935,"charjabug":737,"charmander":4,"charmeleon":5,"charizard":6,
    "chespin":650,"chewtle":833,"chikorita":152,"chimchar":390,"chimecho":358,
    "chinchou":170,"chingling":433,"clamperl":366,"clauncher":692,"claydol":344,"clefable":36,
    "clefairy":35,"cleffa":173,"cloyster":91,"clodsire":980,"coalossal":839,
    "cobalion":638,"cofagrigus":563,"combee":415,"copperajah":879,"corphish":341,
    "corsola":222,"corsola-galarian":222,"corviknight":823,"corvisquire":822,
    "cottonee":546,"crabrawler":739,"cradily":346,"cranidos":408,"crawdaunt":342,
    "cresselia":488,"crobat":169,"croagunk":453,"crustle":558,"cubchoo":613,
    "cubone":104,"cufant":878,"cursola":864,"cutiefly":742,"cyclizar":967,
    "cyndaquil":155,"dachsbun":927,"darmanitan":555,"darmanitan-galarian":555,
    "darumaka":554,"dartrix":724,"decidueye":724,"decidueye-hisuian":724,
    "deino":633,"delcatty":301,"dewgong":87,"dewpider":751,"dhelmise":781,
    "diancie":719,"diggersby":660,"dipplin":1011,"dolliv":929,"donphan":232,
    "dondozo":977,"dottler":825,"doublade":680,"dracovish":882,"dracozolt":880,"dragalge":691,
    "dragonair":148,"dragonite":149,"drampa":780,"drapion":452,"drakloak":886,
    "dreepy":885,"drednaw":834,"drifblim":426,"drifloon":425,"drilbur":529,
    "druddigon":621,"dubwool":832,"dudunsparce":982,"dudunsparce-three-segment":982,
    "duraludon":884,"durant":632,"dusclops":356,"duskull":355,"dwebble":557,
    "eelektrik":603,"eevee":133,"eiscue":875,"ekans":23,"eldegoss":830,
    "electabuzz":125,"electrike":309,"electrode-hisuian":101,"elekid":239,
    "emboar":500,"enamorus":905,"escavalier":589,"espathra":956,"espurr":677,
    "excadrill":530,"exeggcute":102,"falinks":870,"farigiraf":981,"feebas":349,
    "fennekin":653,"feraligatr":160,"ferroseed":597,"ferrothorn":598,
    "fidough":926,"finizen":963,"finneon":456,"flabebe":669,"fletchinder":662,
    "fletchling":661,"flittle":955,"floatzel":419,"floette":670,"florges":671,"flutter-mane":987,
    "flygon":330,"foongus":590,"forretress":205,"fortree":0,"froslass":478,
    "froakie":656,"frosmoth":873,"fraxure":611,"frigibax":996,"fuecoco":909,
    "gallade":475,"galvantula":596,"garchomp":445,"gardevoir":282,"garganacl":934,
    "gastly":92,"gastrodon":423,"gengar":94,"geodude":74,"geodude-alolan":74,
    "gholdengo":1000,"gible":443,"gigalith":526,"gimmighoul":999,"girafarig":203,
    "glameow":431,"glimmora":970,"gligar":471,"gliscor":472,"glimmet":969,"gloom":44,
    "golem":76,"golem-alolan":76,"golisopod":768,"golurk":623,"goodra-hisuian":706,
    "goomy":704,"gossifleur":829,"grafaiai":960,"granbull":210,"graveler-alolan":75,
    "great-tusk":984,"greavard":971,"grimmsnarl":861,"grimer-alolan":88,
    "grotle":388,"grookey":810,"growlithe":58,"growlithe-hisui":58,"grubbin":736,"gulpin":316,"gurdurr":533,"gyarados":130,
    "hakamo-o":783,"happiny":440,"hariyama":297,"hatenna":856,"hatterene":858,
    "hawlucha":701,"haxorus":612,"helioptile":694,"heliolisk":695,"heracross":214,
    "herdier":507,"hippopotas":449,"hitmonchan":107,"hitmonlee":106,"hitmontop":237,
    "honchkrow":430,"honedge":679,"horsea":116,"houndoom":229,"houndour":228,
    "houndstone":1014,"huntail":367,"hydapple":1019,"hydrapple":1019,
    "hydreigon":635,"impidimp":859,"incineroar":727,"infernape":392,"inteleon":818,
    "iron-bundle":991,"iron-jugulis":994,"iron-thorns":993,"iron-treads":990,
    "iron-valiant":996,"jangmo-o":782,"jellicent":593,"joltik":595,"kabuto":140,
    "kabutops":141,"kadabra":64,"kangaskhan":115,"karrablast":588,"kartana":798,
    "kecleon":352,"kilowattrel":941,"kingambit":1001,"kingdra":230,"kingler":99,
    "klawf":950,"kleavor":900,"klefki":707,"koffing":109,"krokorok":552,
    "krookodile":553,"lairon":305,"lampent":608,"landorus":645,"lanturn":171,
    "lapras":131,"larvitar":246,"latias":380,"latios":381,"leavanny":542,"liepard":510,
    "lileep":345,"lillipup":506,"linoone-galarian":264,"litleo":667,"litten":725,
    "lokix":952,"lombre":271,"lopunny":428,"lotad":270,"lucario":448,
    "ludicolo":272,"lumineon":457,"lunatone":337,"luvdisc":370,"luxio":404,
    "lycanroc-dusk":745,"lycanroc-midnight":745,"magby":240,"magcargo":219,
    "magikarp":129,"magneton":82,"magnezone":462,"makuhita":296,"malamar":687,
    "mamoswine":473,"mandibuzz":630,"manectric":310,"mankey":56,"mantine":226,
    "mantyke":458,"mareanie":747,"mareep":179,"marshadow":802,"marowak":105,
    "masquerain":284,"maschiff":942,"mawile":303,"medicham":308,"meditite":307,
    "meganium":154,"meowscarada":908,"meowth":52,"meowth-alolan":52,
    "meowth-galarian":52,"meowstic":678,"meowstic-female":678,"mesprit":481,
    "metang":375,"metagross":376,"mienfoo":619,"mienshao":620,"milcery":868,
    "milotic":350,"mime-jr":439,"mimikyu":778,"minior":774,"minior-core-blue":774,
    "minior-core-green":774,"minior-core-indigo":774,"minior-core-orange":774,
    "minior-core-red":774,"misdreavus":200,"mismagius":429,"morpeko":877,
    "morelull":755,"morgrem":860,"mr-mime":122,"mr-mime-galarian":122,
    "mudkip":258,"mudbray":749,"muk-alolan":89,"munchlax":446,"murkrow":198,
    "nacli":932,"naclstack":933,"naganadel":804,"natu":177,"nidoran-f":29,
    "nidoran-m":32,"nincada":290,"ninjask":291,"noibat":714,"noivern":715,
    "nosepass":299,"numel":322,"nuzleaf":274,"nymble":919,"obstagoon":862,
    "octillery":224,"oddish":43,"omanyte":138,"omastar":139,"onix":95,
    "orbeetle":826,"orthworm":968,"oshawott":501,"overqwil":904,"palafin":964,
    "palpitoad":536,"palossand":770,"pawmi":921,"pawmo":922,"pawmot":923,
    "pawniard":624,"perrserker":863,"persian":53,"persian-alolan":53,
    "petilil":548,"phantump":708,"phanpy":231,"pheromosa":795,"pichu":172,
    "pidgey":16,"pikachu":25,"pineco":204,"pinsir":127,"piplup":393,
    "poliwag":60,"poliwhirl":61,"politoed":186,"poliwrath":62,"poltchageist":1012,
    "polteageist":855,"ponyta-galarian":77,"porygon":137,"porygon2":233,
    "popplio":728,"probopass":476,"pupitar":247,"purugly":432,"pyroar":668,
    "pyukumuku":771,"qwilfish":211,"qwilfish-hisuian":211,"quagsire":195,
    "quaquaval":914,"quaxly":912,"quaxwell":913,"quilava":156,"raichu":26,
    "raichu-alolan":26,"ralts":280,"relicanth":369,"reuniclus":579,"revavroom":966,
    "ribombee":743,"rhydon":112,"rhyhorn":111,"rhyperior":464,"riolu":447,
    "rillaboom":812,"rockruff":744,"roggenrola":524,"rolycoly":837,"rookidee":821,
    "roselia":315,"roserade":407,"rotom":479,"rufflet":627,"runerigus":867,
    "sableye":302,"salandit":757,"salazzle":758,"salamence":373,"samurott":503,
    "samurott-hisuian":503,"sandile":551,"sandshrew":27,"sandshrew-alolan":27,
    "sandygast":769,"scizor":212,"scolipede":545,"scorbunny":813,"scrafty":560,
    "scraggy":559,"scream-tail":986,"sceptile":254,"scyther":123,"seadra":117,
    "seismitoad":537,"seedot":273,"seel":86,"serperior":497,"sewaddle":540,"sharpedo":319,
    "shaymin":492,"shellder":90,"shellos":422,"shelmet":616,"shieldon":410,
    "shiinotic":756,"shiftry":275,"shinx":403,"shroodle":944,"shroomish":285,"shuckle":213,
    "shuppet":353,"sigilyph":561,"sinistcha":1013,"sinistea":854,"sizzlipede":850,
    "skeledirge":911,"skarmory":227,"skitty":300,"skrelp":690,"skorupi":451,
    "sliggoo-hisuian":705,"slowbro":80,"slowbro-galarian":80,"slowking":199,
    "slowking-galarian":199,"slowpoke":79,"slowpoke-galarian":79,"slugma":218,
    "smoliv":928,"snivy":495,"sneasel":215,"sneasel-hisuian":215,"sneasler":903,
    "snom":872,"snorlax":143,"snorunt":361,"snover":459,"snubbull":209,
    "sobble":816,"solrock":338,"spinda":327,"spiritomb":442,"spheal":363,
    "sprigatito":906,"squirtle":7,"stakataka":805,"stantler":234,"staraptor":398,"starly":396,
    "starmie":121,"staryu":120,"steelix":208,"stonjourner":874,"stoutland":508,
    "stufful":759,"stunfisk":618,"stunfisk-galarian":618,"stunky":434,
    "surskit":283,"swablu":333,"swadloon":541,"swampert":260,"swanna":581,
    "swalot":317,"swinub":220,"tadbulb":938,"tangela":114,"tangrowth":465,"talonflame":663,
    "tatsugiri":978,"tatsugiri-droopy":978,"tatsugiri-stretchy":978,
    "tapu-bulu":788,"tapu-koko":785,"tauros":128,"tauros-paldean":128,
    "tauros-paldean-aqua-breed":128,"tauros-paldean-blaze-breed":128,
    "teddiursa":216,"tentacool":72,"tentacruel":73,"tepig":498,"terrakion":639,"thundurus":642,
    "timburr":532,"tinkatink":957,"tinkatuff":958,"tinkaton":959,"toedscool":948,
    "toedscruel":1002,"togedemaru":777,"togepi":175,"togekiss":468,"togetic":176,
    "torchic":255,"torkoal":324,"tornadus":641,"torracat":726,"torterra":389,
    "totodile":158,"toxapex":748,"toxel":848,"toxtricity":10184,"trapinch":328,"treecko":252,
    "turtwig":387,"turtonator":776,"tympole":535,"tynamo":602,"typhlosion":157,
    "typhlosion-hisuian":157,"tyrogue":236,"tyrunt":696,"unown":201,"unown-e":201,
    "unown-emark":201,"unown-i":201,"unown-l":201,"unown-p":201,"unown-s":201,
    "unown-w":201,"ursaluna":901,"ursaluna-bloodmoon":901,"ursaring":217,
    "uxie":480,"varoom":965,"vaporeon":134,"venipede":543,"venusaur":3,
    "veluza":976,"vibrava":329,"victreebel":71,"vikavolt":738,"virizion":640,
    "volcarona":637,"vullaby":629,"vulpix-alolan":37,"walking-wake":1009,
    "walrein":365,"wattrel":940,"weavile":461,"weedle":13,"weezing-galarian":110,
    "whimsicott":547,"whirlipede":544,"whiscash":340,"wimpod":767,"wooloo":831,
    "wooper":194,"wooper-paldean":194,"wyrdeer":899,"yamask":562,
    "yamask-galarian":562,"yanma":193,"yanmega":469,"yamper":835,"zebstrika":523,
    "zigzagoon-galarian":263,"zorua":570,"zorua-hisuian":570,"zoroark":571,
    "zoroark-hisuian":571,"zubat":41,"zygarde-10":718
};

// Function to get PokéAPI sprite URL using Pokédex number
function getPokemonIcon(pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

// Function to find Pokémon data by name.
// Returns an object { name, id } compatible with the rest of the code,
// by looking up the ID in pokemonIdMap using the lowercased name.
function findPokemonByName(name) {
    if (!name) return null;
    const id = pokemonIdMap[name.toLowerCase()]; // look up by lowercase key
    if (!id) return null;                    // not found → no sprite
    return { name: name, id: id };               // return same shape as before
}

// Function to preload and cache Pokémon images
function preloadPokemonImage(pokemonId) {
    return new Promise((resolve, reject) => {
        if (pokemonImageCache[pokemonId]) {
            resolve(pokemonImageCache[pokemonId]);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS for external images
        img.onload = function() {
            pokemonImageCache[pokemonId] = img;
            resolve(img);
        };
        img.onerror = function() {
            console.warn(`Failed to load Pokémon image for ID: ${pokemonId}`);
            reject(new Error(`Failed to load image for Pokémon ID: ${pokemonId}`));
        };
        img.src = getPokemonIcon(pokemonId);
    });
}

// Main initialization function
function initializeEncounterTracker() {
    loadSavedData();
    buildEncounterInterface();
    initializeKOChart();
    initializeExportControls();
    updateKOChart();
    updateKOStatsUI();
    initializeGraphToggle();
}

// ────
// SORT CONTROLS
// Injects the sort button bar above the encounter grid.
// Each button sets currentSort and re-renders the grid.
// ────
function buildSortControls() {
    // Find the section that wraps the encounter grid
    const section = document.querySelector('.encounter-tracker-section .container');
    if (!section) return;

    // Create the sort bar wrapper div
    const sortBar = document.createElement('div');
    sortBar.className = 'sort-controls'; // styled in CSS

    // Label text so users know what the buttons do
    const sortLabel = document.createElement('span');
    sortLabel.className = 'sort-label';
    sortLabel.textContent = 'Sort by:';
    sortBar.appendChild(sortLabel);

    // Define the two sort options: value used internally, label shown on button
    const sortOptions = [
        { value: 'game',  label: 'Game Order' },
        { value: 'alpha', label: 'Alphabetical' }
    ];

    // Build one button per sort option
    sortOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'sort-btn'; // base style
        btn.setAttribute('data-sort', opt.value); // used to identify active button
        btn.textContent = opt.label;

        // Mark the default active button on first render
        if (opt.value === currentSort) btn.classList.add('sort-btn-active');

        btn.addEventListener('click', function() {
            // Skip if already on this sort
            if (currentSort === opt.value) return;

            // Update the active sort mode
            currentSort = opt.value;

            // Remove active class from all buttons, add to clicked one
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('sort-btn-active'));
            btn.classList.add('sort-btn-active');

            // Re-render the grid with the new sort order
            rebuildEncounterGrid();
        });

        sortBar.appendChild(btn);
    });

    // ── Hide Completed button ──
    // Sits in the same toolbar row as the sort buttons.
    // Clicking it hides any encounter-row that already has a Pokémon selected,
    // leaving only the "empty" (not yet assigned) rows visible.
    const hideCompletedBtn = document.createElement('button');
    hideCompletedBtn.className = 'sort-btn hide-completed-btn'; // reuse sort-btn style
    hideCompletedBtn.id = 'hideCompletedBtn';
    hideCompletedBtn.textContent = 'Hide Completed';

    // Track whether completed rows are currently hidden
    let completedHidden = false;

    hideCompletedBtn.addEventListener('click', function() {
        completedHidden = !completedHidden; // flip the toggle state

        // Update button label to reflect current state
        hideCompletedBtn.textContent = completedHidden ? 'Show All' : 'Hide Completed';

        // Toggle active styling so the button looks "pressed" when filtering is on
        hideCompletedBtn.classList.toggle('sort-btn-active', completedHidden);

        // Loop every encounter row and show/hide based on whether it has a selection
        document.querySelectorAll('.encounter-row').forEach(row => {
            const select = row.querySelector('.pokemon-select');
            // A row is "completed" if its dropdown has a non-empty value selected
            const isCompleted = select && select.value !== '';
            if (completedHidden && isCompleted) {
                row.style.display = 'none'; // hide completed rows
            } else {
                row.style.display = '';     // restore default display
            }
        });
    });

    // ── Row 2: Hide Completed button on its own centered line ──
    // We create a separate wrapper div (.sort-controls-row2) for the Hide Completed button
    // so it sits on its own line below the Sort By buttons, both centered independently.
    // If we appended it to sortBar, it would sit on the same flex row as the sort buttons.
    const hideRow = document.createElement('div');
    hideRow.className = 'sort-controls-row2'; // styled in CSS to be centered
    hideRow.appendChild(hideCompletedBtn);     // move the button into this second row

    // Insert both rows before the KO counter and grid
    const totalKOTracker = document.getElementById('totalKOTracker');
    if (totalKOTracker) {
        section.insertBefore(sortBar, totalKOTracker);   // row 1: Sort By
        section.insertBefore(hideRow, totalKOTracker);   // row 2: Hide Completed
    } else {
        section.prepend(hideRow);   // fallback: insert row 2 first (prepend reverses order)
        section.prepend(sortBar);   // then row 1 goes above it
    }
}

// ────
// GET SORTED LOCATIONS
// Returns the locations array in the order dictated by currentSort.
// 'game'  → original Object.keys() order (insertion order)
// 'alpha' → sorted A–Z by location name string
// ────
function getSortedLocations() {
    if (currentSort === 'alpha') {
        // Spread into a new array so we don't mutate the original, then sort A–Z
        return [...locations].sort((a, b) => a.localeCompare(b));
    }
    // Default: game order (original insertion order)
    return [...locations];
}

// ────
// REBUILD ENCOUNTER GRID
// Clears and re-renders only the grid rows (not the sort bar or KO counter).
// Called on initial build and whenever the sort mode changes.
// ────
function rebuildEncounterGrid() {
    const container = document.getElementById('encounterColumns');
    if (!container) return;

    // Clear existing rows so we can re-render in new order
    container.innerHTML = '';

    // Get locations in the currently selected sort order
    const sortedLocations = getSortedLocations();

    // Render each location as a flat row directly into the grid container.
    // CSS grid handles the 3-column left-to-right layout automatically.
    sortedLocations.forEach(location => {
        const encounterRow = createEncounterRow(location);
        container.appendChild(encounterRow);
    });

    // Restore saved selections after the DOM is rebuilt
    setTimeout(() => {
        restoreUIState();
    }, 100);
}

// Build the main encounter tracking interface
function buildEncounterInterface() {
    // First, inject the sort controls above the grid
    buildSortControls();

    // Then render the initial grid in game order
    rebuildEncounterGrid();
}

// Create a single encounter row with KO tracking
function createEncounterRow(locationName) {
    const row = document.createElement('div');
    row.className = 'encounter-row';
    row.setAttribute('data-location', locationName);

    // Pokémon icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'pokemon-icon';
    iconContainer.setAttribute('aria-label', `Pokémon icon for ${locationName}`);

    // Location name display
    const locationSpan = document.createElement('span');
    locationSpan.className = 'location-name';
    locationSpan.textContent = locationName;

    // Pokémon selection dropdown
    const pokemonSelect = document.createElement('select');
    pokemonSelect.className = 'pokemon-select';
    pokemonSelect.setAttribute('aria-label', `Select Pokémon for ${locationName}`);

    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Pokémon';
    pokemonSelect.appendChild(defaultOption);

    // Get the Pokémon available at this specific location from locationEncounters.
    // If the location isn't in the map for some reason, fall back to an empty array.
    const availablePokemon = locationEncounters[locationName] || [];

    // Build one <option> per Pokémon available at this location.
    // The display name is the raw string from the array (already Title-Cased).
    // We look up the PokéAPI ID using the lowercased name so sprites still work.
    availablePokemon.forEach(pokemonName => {
        const option = document.createElement('option');
        option.value = pokemonName;                    // stored value
        option.textContent = pokemonName;                    // shown in dropdown (no % shown)
        const pokeId = pokemonIdMap[pokemonName.toLowerCase()]; // look up sprite ID
        if (pokeId) option.setAttribute('data-pokemon-id', pokeId);
        pokemonSelect.appendChild(option);
    });

    // KO tracker (initially hidden)
    const koTracker = createKOTracker(locationName);

    // Pokémon selection event
    pokemonSelect.addEventListener('change', function() {
        handlePokemonSelection(this, iconContainer, koTracker, locationName);
    });

    // Assemble the row
    row.appendChild(iconContainer);
    row.appendChild(locationSpan);
    row.appendChild(pokemonSelect);
    row.appendChild(koTracker);

    return row;
}

// Create KO tracking controls
function createKOTracker(locationName) {
    const koTracker = document.createElement('div');
    koTracker.className = 'ko-tracker';
    koTracker.style.display = 'none';

    // Percentage of total KOs
    const koPercent = document.createElement('span');
    koPercent.className = 'ko-percent';
    koPercent.textContent = '0%';
    koPercent.style.marginRight = '8px';
    koPercent.title = 'Percent of all KOs';

    // KO label and controls
    const koLabel = document.createElement('span');
    koLabel.className = 'ko-label';
    koLabel.textContent = 'KOs:';

    const koControls = document.createElement('div');
    koControls.className = 'ko-controls';

    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'ko-btn';
    decreaseBtn.textContent = '−';
    decreaseBtn.setAttribute('aria-label', 'Decrease KO count');

    const koCount = document.createElement('span');
    koCount.className = 'ko-count';
    koCount.textContent = '0';

    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'ko-btn';
    increaseBtn.textContent = '+';
    increaseBtn.setAttribute('aria-label', 'Increase KO count');

    decreaseBtn.addEventListener('click', function() {
        updateKOCount(locationName, -1, koCount);
    });

    increaseBtn.addEventListener('click', function() {
        updateKOCount(locationName, 1, koCount);
    });

    koControls.appendChild(decreaseBtn);
    koControls.appendChild(koCount);
    koControls.appendChild(increaseBtn);

    // Build the tracker: label + buttons on one line, percent on its own line below.
    // This prevents the percent from overflowing outside the card boundary.
    koTracker.appendChild(koLabel);       // "KOs:" text
    koTracker.appendChild(koControls);    // − 0 + buttons
    koTracker.appendChild(koPercent);     // "0%" sits below on its own line

    return koTracker;
}

// Handle Pokémon selection and show/hide KO tracker
function handlePokemonSelection(selectElement, iconContainer, koTracker, locationName) {
    iconContainer.innerHTML = '';
    const selectedPokemonName = selectElement.value;

    if (!selectedPokemonName) {
        koTracker.style.display = 'none';
        delete encounterData[locationName];
        saveData();
        updateKOChart();
        updateKOStatsUI();
        return;
    }

    const selectedPokemon = findPokemonByName(selectedPokemonName);
    if (!selectedPokemon) return;

    // Show Pokémon icon
    const pokemonImage = document.createElement('img');
    pokemonImage.src = getPokemonIcon(selectedPokemon.id);
    pokemonImage.alt = `${selectedPokemonName} sprite`;
    pokemonImage.title = `${selectedPokemonName} at ${locationName}`;
    pokemonImage.style.opacity = '0';
    pokemonImage.style.transition = 'opacity 0.3s ease';
    pokemonImage.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    pokemonImage.addEventListener('error', function() {
        this.alt = '❌';
        this.title = `Failed to load ${selectedPokemonName} sprite`;
    });
    iconContainer.appendChild(pokemonImage);

    // Show KO tracker and update data
    koTracker.style.display = 'flex';
    encounterData[locationName] = selectedPokemonName;
    if (!koData[locationName]) koData[locationName] = 0;
    const koCountElement = koTracker.querySelector('.ko-count');
    koCountElement.textContent = koData[locationName] || 0;
    saveData();
    updateKOChart();
}

// Update KO count for a location
function updateKOCount(locationName, change, koCountElement) {
    if (!encounterData[locationName]) return;
    if (!koData[locationName]) koData[locationName] = 0;
    koData[locationName] = Math.max(0, koData[locationName] + change);
    koCountElement.textContent = koData[locationName];
    saveData();
    updateKOChart();
    updateKOStatsUI();
}

function updateKOStatsUI() {
    // Update total KO tracker
    const totalKOs = Object.values(koData).reduce((sum, count) => sum + count, 0);
    const totalKOTracker = document.getElementById('totalKOTracker');
    if (totalKOTracker) {
        totalKOTracker.textContent = `Total KOs: ${totalKOs}`;
    }

    // Update each row's percent
    document.querySelectorAll('.encounter-row').forEach(row => {
        const location = row.getAttribute('data-location');
        const percentSpan = row.querySelector('.ko-percent');
        if (percentSpan && koData[location] && totalKOs > 0) {
            const percent = ((koData[location] / totalKOs) * 100).toFixed(1);
            percentSpan.textContent = `${percent}%`;
        } else if (percentSpan) {
            percentSpan.textContent = '0%';
        }
    });
}

// --- CHART.JS PLUGIN: draws location label + Pokémon sprite to the left of each bar ---
const pokemonImagePlugin = {
    id: 'pokemonImagePlugin',
    afterDraw: function(chart) {
        const yAxis = chart.scales.y;
        const ctx = chart.ctx;

        if (!yAxis || !chart.pokemonImages) return;

        // imageSize: pixel dimensions of the square sprite
        const imageSize = 40;
        // gap between sprite and the y-axis line
        const spriteGap = 8;
        // gap between location text and the sprite
        const textGap = 6;
        // font for the location label
        const fontSize = 11;

        chart.pokemonImages.forEach((pokemonId, index) => {
            // yPos is the vertical center of this bar
            const yPos = yAxis.getPixelForValue(index);

            // ── Draw the Pokémon sprite ──
            // Place it just to the left of the y-axis
            const spriteX = yAxis.left - imageSize - spriteGap;
            const spriteY = yPos - imageSize / 2;

            if (pokemonId && pokemonImageCache[pokemonId]) {
                const img = pokemonImageCache[pokemonId];

                // Clip to a circle so the sprite looks clean
                ctx.save();
                ctx.beginPath();
                ctx.arc(spriteX + imageSize / 2, yPos, imageSize / 2, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, spriteX, spriteY, imageSize, imageSize);
                ctx.restore();
            }

            // ── Draw the location name text ──
            // Retrieve the label stored in chart.data.labels for this bar index
            const locationLabel = chart.data.labels[index] || '';

            ctx.save();
            ctx.font = `bold ${fontSize}px sans-serif`; // bold small caps style
            ctx.fillStyle = 'rgba(255,255,255,0.85)';   // light text on dark background
            ctx.textAlign = 'right';                    // right-align so it ends just before the sprite
            ctx.textBaseline = 'middle';                 // vertically center with the sprite

            // x: leave a small gap to the left of the sprite
            const textX = spriteX - textGap;
            ctx.fillText(locationLabel, textX, yPos);
            ctx.restore();
        });
    }
};

// Register the plugin with Chart.js
Chart.register(pokemonImagePlugin);

// Initialize the KO statistics chart
function initializeKOChart() {
    const ctx = document.getElementById('koChart');
    if (!ctx) return;

    koChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                // This dataset is used for the KO counts
                label: 'KO Count',
                data: [],
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                bar: {
                barThickness: 40, // or 48, to match your icon size
                borderRadius: 4  // optional: makes bars look rounder
                }
            },
            layout: {
                padding: {
                    left: 140 // Make room for Pokémon images
                }
            },
            plugins: {
                title: {
                    display: false, // Hide the title
                    //text: 'KO Counter',
                    color: '#ffff',
                    font: {
                    size: 16,
                    family: 'Bebas Neue'
                    }
                },
                legend: {
                    display: false, // Hide the legend
                    // labels: {
                    //     color: '#ffff'
                    // }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                    color: '#ffff',
                    stepSize: 1
                    },
                    grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                    color: 'transparent', // Hide text labels completely
                    callback: function() {
                    return ""; // Return empty string for labels
                    }
                    },
                    grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    ctx.style.height = '400px';
}

// Update the KO chart with current data and Pokémon images
async function updateKOChart() {
    if (!koChart) return;

    // Get locations with KOs > 0
    const locationsWithKOs = Object.entries(koData)
        .filter(([location, count]) => count > 0 && encounterData[location])
        .sort(([,a], [,b]) => b - a);

    if (locationsWithKOs.length === 0) {
        document.getElementById('koStatsSection').style.display = 'none';
        return;
    }
    document.getElementById('koStatsSection').style.display = 'block';

    // ADD THIS: Dynamic chart height calculation
    const minHeight = 400; // Minimum chart height in px
    const barHeight = 42;  // Height per bar (includes spacing)
    const numBars = locationsWithKOs.length;
    const chartHeight = Math.max(minHeight, numBars * barHeight);

    // Apply the height to the canvas
    const chartCanvas = document.getElementById('koChart');
    if (chartCanvas) {
        chartCanvas.style.height = chartHeight + 'px';
        chartCanvas.height = chartHeight; // Also set the actual canvas height
    }

    // Prepare chart data
    const labels = locationsWithKOs.map(([location]) => location); // Use location names as labels (will be hidden)
    const data = locationsWithKOs.map(([, count]) => count);

    // Define color constants
    const GOLD = '#FFD700';
    const SILVER = '#C0C0C0';
    const RED = '#DC3545';
    const BLUE = '#0074D9';

    // Build color array based on rank
    const barColors = data.map((_, i) => {
        if (i < 5) return GOLD;
        if (i < 15) return SILVER;
        if (i < 25) return RED;
        return BLUE;
    });

    // Get Pokémon IDs for images
    const pokemonIds = [];
    for (const [location] of locationsWithKOs) {
        const pokemon = encounterData[location];
        const poke = findPokemonByName(pokemon);
        if (poke) {
            pokemonIds.push(poke.id);
            // Preload the image
            try {
                await preloadPokemonImage(poke.id);
            } catch (error) {
                console.warn(`Failed to preload image for ${pokemon}:`, error);
            }
        } else {
            pokemonIds.push(null);
        }
    }

    // Update chart data
    koChart.data.labels = labels;
    koChart.data.datasets[0].data = data;
    koChart.data.datasets[0].backgroundColor = barColors;
    koChart.pokemonImages = pokemonIds;

    // ── Fix: Chart.js can't measure a hidden element correctly.
    // We set display:block above, but the browser hasn't painted yet.
    // requestAnimationFrame defers the resize+update until AFTER the browser
    // has actually rendered the section as visible, so Chart.js gets real dimensions.
    requestAnimationFrame(() => {
        koChart.resize();  // first resize: recalculate canvas dimensions now that it's visible
        koChart.update();  // redraw with new data
        koChart.resize();  // second resize: catches any leftover dimension mismatch after draw
    });
}

// --- Data Persistence and Export (unchanged from previous version) ---

function initializeExportControls() {
    const exportToSheetsBtn = document.getElementById('exportToSheets');
    const exportToFileBtn = document.getElementById('exportToFile');
    const clearAllDataBtn = document.getElementById('clearAllData');

    if (exportToSheetsBtn) {
        exportToSheetsBtn.addEventListener('click', exportToGoogleSheets);
    }
    if (exportToFileBtn) {
        exportToFileBtn.addEventListener('click', exportToFile);
    }
    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', clearAllData);
    }
}

function exportToGoogleSheets() {
    const statusElement = document.getElementById('exportStatus');
    const exportData = {
        timestamp: new Date().toISOString(),
        encounters: encounterData,
        koData: koData,
        summary: generateSummaryData()
    };
    statusElement.textContent = 'Exporting to Google Sheets...';
    statusElement.className = 'export-status';
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
    })
    .then(() => {
        statusElement.textContent = 'Successfully exported to Google Sheets!';
        statusElement.className = 'export-status success';
        setTimeout(() => { statusElement.textContent = ''; statusElement.className = 'export-status'; }, 5000);
    })
    .catch(error => {
        statusElement.textContent = 'Export failed. Please try downloading as file instead.';
        statusElement.className = 'export-status error';
        setTimeout(() => { statusElement.textContent = ''; statusElement.className = 'export-status'; }, 5000);
    });
}

function exportToFile() {
    const exportData = {
        timestamp: new Date().toISOString(),
        encounters: encounterData,
        koData: koData,
        summary: generateSummaryData()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `terra-emerald-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    const statusElement = document.getElementById('exportStatus');
    statusElement.textContent = 'Data downloaded successfully!';
    statusElement.className = 'export-status success';
    setTimeout(() => { statusElement.textContent = ''; statusElement.className = 'export-status'; }, 3000);
}

function generateSummaryData() {
    const totalEncounters = Object.keys(encounterData).length;
    const totalKOs = Object.values(koData).reduce((sum, count) => sum + count, 0);
    const pokemonCounts = {};
    Object.values(encounterData).forEach(pokemon => {
        pokemonCounts[pokemon] = (pokemonCounts[pokemon] || 0) + 1;
    });
    const pokemonKOs = {};
    Object.entries(koData).forEach(([location, kos]) => {
        const pokemon = encounterData[location];
        if (pokemon && kos > 0) {
            pokemonKOs[pokemon] = (pokemonKOs[pokemon] || 0) + kos;
        }
    });
    return {
        totalEncounters,
        totalKOs,
        pokemonCounts,
        pokemonKOs,
        averageKOsPerEncounter: totalEncounters > 0 ? (totalKOs / totalEncounters).toFixed(2) : 0
    };
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear all encounter and KO data? This cannot be undone.')) return;
    encounterData = {};
    koData = {};
    document.querySelectorAll('.pokemon-select').forEach(select => { select.value = ''; });
    document.querySelectorAll('.pokemon-icon').forEach(icon => { icon.innerHTML = ''; });
    document.querySelectorAll('.ko-tracker').forEach(tracker => {
        tracker.style.display = 'none';
        const countElement = tracker.querySelector('.ko-count');
        if (countElement) countElement.textContent = '0';
    });
    saveData();
    updateKOChart();
    updateKOStatsUI();
    const statusElement = document.getElementById('exportStatus');
    statusElement.textContent = 'All data cleared successfully!';
    statusElement.className = 'export-status success';
    setTimeout(() => { statusElement.textContent = ''; statusElement.className = 'export-status'; }, 3000);
}

function saveData() {
    try {
        localStorage.setItem('terraEmeraldEncounters', JSON.stringify(encounterData));
        localStorage.setItem('terraEmeraldKOs', JSON.stringify(koData));
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

function loadSavedData() {
    try {
        const savedEncounters = localStorage.getItem('terraEmeraldEncounters');
        const savedKOs = localStorage.getItem('terraEmeraldKOs');
        if (savedEncounters) encounterData = JSON.parse(savedEncounters);
        if (savedKOs) koData = JSON.parse(savedKOs);
    } catch (error) {
        encounterData = {};
        koData = {};
    }
}

function restoreUIState() {
    Object.entries(encounterData).forEach(([locationName, pokemonName]) => {
        const row = document.querySelector(`[data-location="${locationName}"]`);
        if (row) {
            const select = row.querySelector('.pokemon-select');
            const iconContainer = row.querySelector('.pokemon-icon');
            const koTracker = row.querySelector('.ko-tracker');
            select.value = pokemonName;
            handlePokemonSelection(select, iconContainer, koTracker, locationName);
        }
        updateKOStatsUI();
    });

}















