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

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION ENCOUNTER DATA
// Each key is a location name (normalized: floors use "1F", "2F", "B1F", etc.)
// Each value is an array of Pokémon name strings available at that location.
// Order matches the encounters.json file exactly — no alphabetizing.
// The "Starter" entry is manually added first with the three starter choices.
// ─────────────────────────────────────────────────────────────────────────────
const locationEncounters = {
    // ── Special: Starter selection ──────────────────────────────────────────
    "Starter": ["Fennekin", "Froakie", "Chespin"],

    // ── Routes ──────────────────────────────────────────────────────────────
    "Route 101": ["Aipom","Bidoof","Bunnelby","Helioptile","Litleo","Pidgey","Smoliv","Stantler","Wooloo","Zigzagoon-Galarian"],
    "Route 102": ["Ducklett","Finneon","Fletchling","Mantyke","Minior","Natu","Noibat","Piplup","Quaxly","Rookidee","Squirtle","Starly","Surskit","Swablu","Wattrel","Zubat"],
    "Route 103": ["Applin","Arctovish","Arctozolt","Avalugg","Avalugg-Hisuian","Budew","Capsakid","Exeggcute","Gossifleur","Lapras","Lotad","Ludicolo","Morelull","Seel","Sewaddle","Shellder","Shroomish","Smoliv","Sneasel","Spheal","Tangela"],
    "Route 104": ["Araquanid","Beedrill","Blipbug","Butterfree","Clauncher","Combee","Cutiefly","Dewpider","Grubbin","Nincada","Ribombee","Scyther","Sewaddle","Sizzlipede","Skrelp","Snom","Surskit","Tentacool","Venipede","Yanma","Yanmega"],
    "Route 105": ["Alakazam","Bibarel","Blaziken","Corviknight","Dipplin","Dracovish","Dragalge","Emboar","Gallade","Hawlucha","Kilowattrel","Lanturn","Magneton","Mantine","Pawmot","Poliwrath","Starmie"],
    "Route 110": ["Chewtle","Chinchou","Corphish","Corvisquire","Cutiefly","Fletchinder","Floette","Houndour","Karrablast","Klefki","Marill","Morpeko","Murkrow","Poliwhirl","Popplio","Scraggy","Shelmet","Stunky","Tinkatuff","Togedemaru","Whiscash"],
    "Route 111": ["Bellibolt","Bramblin","Chinchou","Coalossal","Darmanitan","Drilbur","Eelektrik","Gastrodon","Gligar","Grimer-Alolan","Herdier","Hippopotas","Kleavor","Krokorok","Lycanroc-Dusk","Palpitoad","Poliwhirl","Rhydon","Scrafty","Skarmory","Stunfisk","Stunfisk-Galarian","Swampert","Vullaby","Whiscash"],
    "Route 112": ["Arcanine","Arcanine-Hisuian","Camerupt","Chimecho","Fraxure","Hitmontop","Marill","Rockruff","Scovillain","Vibrava"],
    "Route 113": ["Absol","Bisharp","Bombirdier","Houndoom","Morgrem","Murkrow","Nuzleaf","Scrafty","Skorupi","Sprigatito","Zorua","Zorua-Hisuian"],
    "Route 114": ["Araquanid","Armaldo","Caterpie","Crustle","Feebas","Galvantula","Heracross","Karrablast","Kleavor","Leavanny","Lokix","Magikarp","Marill","Masquerain","Pineco","Pinsir","Ribombee","Scyther","Shuckle","Slowpoke","Surskit","Weedle","Whirlipede","Yanmega"],
    "Route 116": ["Charcadet","Charmander","Combee","Fletchling","Foongus","Gligar","Koffing","Morelull","Nidoran-F","Nidoran-M","Sizzlipede"],
    "Route 117": ["Beedrill","Butterfree","Dartrix","Dolliv","Eldegoss","Feebas","Gloom","Grimer-Alolan","Grotle","Growlithe","Growlithe-Hisuian","Lokix","Lombre","Masquerain","Petilil","Piplup","Quaxwell","Stunfisk","Stunfisk-Galarian","Swadloon","Yanmega"],
    "Route 118": ["Amoonguss","Araquanid","Barraskewda","Beedrill","Blastoise","Breloom","Butterfree","Chinchou","Ferroseed","Finizen","Kangaskhan","Ludicolo","Magikarp","Manectric","Pinsir","Skrelp","Tentacruel","Toxapex","Treecko","Victreebel","Wimpod"],
    "Route 124": ["Araquanid","Barraskewda","Gyarados","Honchkrow","Milotic","Qwilfish","Qwilfish-Hisuian","Samurott","Samurott-Hisuian","Sharpedo"],
    "Petalburg Woods": ["Bellsprout","Bulbasaur","Capsakid","Exeggcute","Oddish","Petilil","Tangela"],
    "Rusturf Tunnel": ["Applin","Axew","Cyclizar","Drampa","Druddigon","Noibat","Swablu","Turtonator"],
    "Granite Cave 1F": ["Aron","Bronzor","Cufant","Klefki","Mawile","Meowth-Galarian","Orthworm","Sandshrew-Alolan","Tinkatink","Varoom"],
    "Granite Cave B1F": ["Cubone","Gligar","Hippopotas","Mudbray","Numel","Onix","Phanpy","Rhyhorn","Sandile","Trapinch"],
    "Mt Pyre 1F": ["Alakazam","Armarouge","Bronzong","Gallade","Gardevoir","Hatterene","Malamar","Medicham","Metagross","Uxie"],
    "Victory Road 1F": ["Absol","Aegislash","Blaziken","Darmanitan-Galarian","Hydreigon","Meowscarada","Mimikyu","Salamence","Scizor","Sneasler","Ursaluna"],
    "Safari Zone South": ["Azelf","Cresselia","Mesprit","Shaymin","Uxie"],
    "Underwater Route 126": ["Carracosta","Dondozo","Gorebyss","Huntail","Lanturn","Relicanth"],
    "Abandoned Ship Rooms B1F": ["Banette","Basculin","Cursola","Dhelmise","Drifloon","Frillish","Gastly","Poltchageist","Sableye","Skrelp"],
    "Granite Cave B2F": ["Amaura","Bergmite","Binacle","Cetoddle","Crabrawler","Eiscue","Mime-Jr","Nosepass","Sandshrew-Alolan","Sneasel","Snom","Snorunt","Snover","Swinub","Vulpix-Alolan"],
    "Fiery Path": ["Camerupt","Chimchar","Coalossal","Fuecoco","Scorbunny","Torchic","Torkoal","Turtonator"],
    "Meteor Falls B1F 2R": ["Buzzwole","Celesteela","Dondozo","Flutter-Mane","Great-Tusk","Iron-Bundle","Iron-Jugulis","Iron-Thorns","Iron-Treads","Iron-Valiant","Kartana","Naganadel","Pheromosa","Roaring-Moon","Scream-Tail","Stakataka","Tatsugiri","Tatsugiri-Droopy","Tatsugiri-Stretchy","Walking-Wake"],
    "Jagged Pass": ["Bombirdier","Clefable","Garganacl","Gigalith","Gliscor","Gurdurr","Jangmo-O","Revavroom","Runerigus","Stonjourner","Vibrava"],
    "Route 106": ["Arrokuda","Buizel","Clamperl","Dondozo","Dratini","Goomy","Gyarados","Lapras","Lotad","Mantyke","Poliwag","Tatsugiri"],
    "Route 107": ["Arrokuda","Carvanha","Clodsire","Corphish","Corsola","Corsola-Galarian","Krabby","Mareanie","Quagsire","Shellder","Staryu","Tympole"],
    "Route 108": ["Arrokuda","Binacle","Buizel","Carvanha","Chewtle","Corphish","Mareanie","Oshawott","Squirtle","Tentacool"],
    "Route 109": ["Clawitzer","Dracovish","Drampa","Dratini","Goomy","Horsea","Seadra","Swablu","Tatsugiri"],
    "Route 115": ["Anorith","Cloyster","Emboar","Farigiraf","Feraligatr","Finizen","Gallade","Gyarados","Heracross","Kabuto","Lapras","Lileep","Meganium","Omanyte","Relicanth","Roserade","Slowbro","Ursaring","Victreebel","Zebstrika"],
    "New Mauville Inside": ["Ampharos","Boltund","Charjabug","Electabuzz","Magneton","Metang","Probopass","Rotom","Togedemaru"],
    "Route 119": ["Bellibolt","Castform","Clawitzer","Dragonair","Enamorus","Goomy","Landorus","Lumineon","Octillery","Quaquaval","Samurott","Samurott-Hisuian","Tapu-Bulu","Tapu-Koko","Thundurus","Tornadus"],
    "Route 120": ["Arboliva","Dipplin","Dragalge","Eldegoss","Electrode-Hisuian","Ferrothorn","Gyarados","Kecleon","Ludicolo","Milotic","Rillaboom","Roserade","Sceptile","Sinistcha","Slowbro","Slowbro-Galarian","Slowking","Slowking-Galarian","Tangrowth","Tentacruel","Toxapex"],
    "Route 121": ["Annihilape","Araquanid","Gardevoir","Glimmora","Hydrapple","Kangaskhan","Kilowattrel","Kingambit","Mamoswine","Volcarona"],
    "Route 122": ["Basculegion","Basculegion-Female","Corsola-Galarian","Cursola","Drifblim","Flittle","Gengar","Jellicent","Mandibuzz","Mismagius","Weezing-Galarian"],
    "Route 123": ["Aerodactyl","Archaludon","Archeops","Bronzong","Corsola-Galarian","Drampa","Druddigon","Forretress","Garchomp","Gyarados","Hawlucha","Haxorus","Liepard","Milotic","Ninjask","Noivern","Palafin","Perrserker","Scrafty","Toxapex","Veluza","Volcarona"],
    "Mt Pyre 2F": ["Banette","Espathra","Gardevoir","Gimmighoul","Golett","Haunter","Honchkrow","Malamar","Mismagius","Tyranitar"],
    "Mt Pyre 3F": ["Annihilape","Ceruledge","Doublade","Froslass","Honedge","Lampent","Mimikyu","Zoroark-Hisuian"],
    "Mt Pyre 4F": ["Marshadow","Unown","Unown-E","Unown-Emark","Unown-I","Unown-L","Unown-P","Unown-S","Unown-W"],
    "Mt Pyre 5F": ["Absol","Bisharp","Grimmsnarl","Incineroar","Meowscarada","Spiritomb","Tyranitar","Weavile"],
    "Mt Pyre 6F": ["Annihilape","Brambleghast","Decidueye","Decidueye-Hisuian","Gholdengo","Mimikyu","Rotom","Skeledirge","Typhlosion","Typhlosion-Hisuian"],
    "Mt Pyre Exterior": ["Bramblin","Decidueye","Houndstone","Phantump","Poltchageist","Pumpkaboo-Super"],
    "Mt Pyre Summit": ["Deino","Dreepy","Dusclops","Pumpkaboo","Pumpkaboo-Large","Pumpkaboo-Small","Rotom","Spiritomb"],
    "Granite Cave Stevens Room": ["Azurill","Cleffa","Cottonee","Fidough","Flabebe","Klefki","Mawile","Milcery","Mime-Jr","Ponyta-Galarian","Snubbull","Tinkatink"],
    "Route 125": ["Avalugg","Barbaracle","Cloyster","Dewgong","Drednaw","Eiscue","Inteleon","Lapras","Samurott","Walrein","Weavile"],
    "Route 126": ["Barbaracle","Barraskewda","Dondozo","Drednaw","Feraligatr","Kingdra","Kingler","Ludicolo","Mantine","Politoed","Poliwrath","Seismitoad"],
    "Route 127": ["Dondozo","Gorebyss","Gyarados","Heracross","Huntail","Lopunny","Magnezone","Milotic","Pyukumuku","Revavroom","Salazzle","Sinistcha","Staraptor","Swanna","Tauros-Paldean-Aqua-Breed","Venusaur","Vikavolt","Volcarona","Zoroark"],
    "Route 128": ["Vaporeon"],
    "Route 131": ["Aerodactyl","Bibarel","Clawitzer","Golisopod","Goodra-Hisuian","Lumineon","Luvdisc","Octillery","Palafin","Primarina","Slowbro","Toxapex"],
    "Route 134": ["Aerodactyl","Azumarill","Barraskewda","Basculegion","Basculegion-Female","Floatzel","Honchkrow","Milotic","Noivern","Sharpedo","Togekiss"],
    "Abandoned Ship Hidden Floor Corridors": ["Araquanid","Banette","Dragalge","Drakloak","Gengar","Jellicent","Palafin","Polteageist","Sableye"],
    "Seafloor Cavern Room 1": ["Aggron","Archeops","Crobat","Duraludon","Durant","Excadrill","Falinks","Kabutops","Mienshao","Palossand","Rhyperior"],
    "Seafloor Cavern Room 2": ["Aggron","Archeops","Crobat","Duraludon","Durant","Excadrill","Falinks","Kabutops","Mienshao","Palossand","Rhyperior"],
    "Seafloor Cavern Room 3": ["Aggron","Archeops","Crobat","Duraludon","Durant","Excadrill","Falinks","Kabutops","Mienshao","Palossand","Rhyperior"],
    "Seafloor Cavern Room 4": ["Aggron","Archeops","Crobat","Duraludon","Durant","Excadrill","Falinks","Kabutops","Mienshao","Palossand","Rhyperior"],
    "Magma Hideout 3F 1R": ["Cinderace","Cobalion","Dragonite","Garganacl","Glimmora","Infernape","Mimikyu","Salamence","Ursaring","Virizion"],
    "Magma Hideout 3F 2R": ["Cinderace","Cobalion","Dragonite","Garganacl","Glimmora","Infernape","Mimikyu","Salamence","Ursaring","Virizion"],
    "Magma Hideout 4F": ["Aerodactyl","Baxcalibur","Blaziken","Garchomp","Hydreigon","Lopunny","Magcargo","Sneasler","Terrakion","Ursaluna","Ursaluna-Bloodmoon"],
    "Magma Hideout 3F 3R": ["Cinderace","Cobalion","Dragonite","Garganacl","Glimmora","Infernape","Mimikyu","Salamence","Ursaring","Virizion"],
    "Magma Hideout 2F 3R": ["Armarouge","Ceruledge","Charizard","Dachsbun","Darmanitan","Darmanitan-Galarian","Tauros-Paldean-Blaze-Breed"],
    "Mirage Tower 1F": ["Baltoy","Cubone","Drilbur","Hippopotas","Sandshrew","Sandygast","Vibrava","Zygarde-10"],
    "Mirage Tower 2F": ["Baltoy","Clefairy","Duosion","Espathra","Granbull","Hatenna","Impidimp","Mawile","Mesprit","Ralts","Sigilyph"],
    "Mirage Tower 3F": ["Drapion","Duskull","Golurk","Greavard","Krookodile","Misdreavus","Sableye","Shuppet","Sinistea","Whirlipede","Yamask","Yamask-Galarian","Zorua-Hisuian"],
    "Mirage Tower 4F": ["Absol","Altaria","Axew","Beldum","Charcadet","Kadabra","Lairon","Lunatone","Onix","Solrock","Spiritomb"],
    "Desert Underpass": ["Aggron","Beartic","Claydol","Copperajah","Drapion","Golem","Gurdurr","Marowak","Polteageist","Serperior","Skarmory","Steelix"],
    "Artisan Cave B1F": ["Buneary","Cyclizar","Eevee","Happiny","Kangaskhan","Porygon","Teddiursa","Zigzagoon-Galarian"],
    "Artisan Cave 1F": ["Arboliva","Audino","Bewear","Chansey","Cyclizar","Diggersby","Grafaiai","Obstagoon","Pyroar","Wyrdeer"],
    "Altering Cave": ["Bronzor","Chimecho","Crobat","Golbat","Magnemite","Nosepass","Pawniard","Perrserker","Riolu","Stufful","Tinkaton","Togedemaru"],
    "Meteor Falls Stevens Cave": ["Buzzwole","Flutter-Mane","Great-Tusk","Iron-Bundle","Iron-Thorns","Iron-Treads","Iron-Valiant","Kartana","Pheromosa","Roaring-Moon","Scream-Tail","Stakataka"],
    "Littleroot Town": ["Barboach","Bulbasaur","Charmander","Chikorita","Cyndaquil","Growlithe","Mudkip","Oshawott","Piplup","Poliwag","Popplio","Shellos","Snivy","Sobble","Squirtle","Tangela","Tepig","Totodile","Tympole","Wooper"],
    "Oldale Grove": ["Ekans","Electrike","Lillipup","Maschiff","Oddish","Roggenrola","Scraggy","Shinx","Snubbull","Stantler","Surskit"],
    "Littleroot Grove": ["Gossifleur","Gulpin","Minior-Core-Blue","Minior-Core-Green","Morpeko","Quaxly","Rolycoly","Sandshrew-Alolan","Slugma","Spheal","Toedscool"],
    "Oldale Town": ["Capsakid","Charcadet","Darumaka","Fletchling","Growlithe","Growlithe-Hisuian","Houndour","Litleo","Numel","Salandit","Sizzlipede"],
    "Petalburg Grove": ["Blitzle","Electrike","Elekid","Helioptile","Mareep","Pichu","Shinx","Tadbulb","Tynamo","Yamper"],
    "Verdanturf Tunnel 1F": ["Aron","Bergmite","Binacle","Cranidos","Dwebble","Geodude","Geodude-Alolan","Klawf","Nacli","Nosepass","Rhyhorn","Rockruff","Roggenrola","Rolycoly"],
    "Verdanturf Tunnel B1F": ["Boldore","Carbink","Glimmet","Lairon","Larvitar","Naclstack","Onix","Orthworm","Rhydon"],
    "Verdanturf Grotto": ["Aerodactyl","Amaura","Archen","Arctovish","Arctozolt","Armaldo","Carbink","Carracosta","Cradily","Cranidos","Diancie","Dracovish","Dracozolt","Glimmet","Kabutops","Omastar","Relicanth","Shieldon","Shuckle","Tyrunt"],
    "Rustboro City": ["Crabrawler","Falinks","Makuhita","Mankey","Mienfoo","Stufful","Tauros-Paldean","Tauros-Paldean-Aqua-Breed","Tauros-Paldean-Blaze-Breed","Timburr","Tyrogue"],
    "Route 102 Grove": ["Croagunk","Nidoran-F","Nidoran-M","Roselia","Salandit","Shroodle","Skorupi","Slowpoke-Galarian","Stunky","Wooper-Paldean","Zubat"],
    "Fallarbor Town": ["Durant","Grookey","Heatmor","Karrablast","Rufflet","Scorbunny","Shelmet","Sobble","Spinda","Stonjourner","Vullaby"],
    "Icefall Cave": ["Arctovish","Arctozolt","Cetoddle","Cubchoo","Frosmoth","Sandshrew-Alolan","Snorunt","Snover","Swinub"],
    "Verdanturf Town": ["Cottonee","Nymble","Pidgey","Snover","Tinkatuff","Toedscool","Turtwig","Zigzagoon-Galarian"],
    "Fortree City": ["Altaria","Corviknight","Gliscor","Hawlucha","Honchkrow","Kilowattrel","Scyther","Shiftry","Staraptor","Talonflame","Togetic"],
    "Rustboro Grove": ["Espurr","Glameow","Litten","Luxio","Meowth","Meowth-Alolan","Meowth-Galarian","Pikachu","Skitty"],
    "Terra Cave End": ["Arcanine-Hisuian","Camerupt","Carkol","Charcadet","Charmeleon","Magby","Quilava","Torkoal","Torracat","Turtonator"],
    "Terra Cave Entrance": ["Amaura","Aron","Boldore","Carkol","Cranidos","Cubone","Rhydon","Rockruff","Shieldon","Tyrunt"],
    "Mauville City": ["Dracozolt","Graveler-Alolan","Joltik","Kilowattrel","Manectric","Morpeko","Pawmi","Pikachu","Togedemaru","Toxel"],
    "Altering Grove": ["Audino","Azumarill","Bibarel","Dewgong","Diggersby","Dolliv","Dunsparce","Girafarig","Heliolisk","Kangaskhan","Linoone-Galarian","Munchlax","Porygon","Stoutland","Stufful","Swanna","Tauros","Togepi","Wyrdeer"],
    "Battle Frontier Outside West": ["Ambipom","Bibarel","Delcatty","Diggersby","Dubwool","Dudunsparce","Dudunsparce-Three-Segment","Persian","Purugly","Snorlax","Spinda","Tauros"],
    "Sky Pillar 4F": ["Arcanine","Archaludon","Centiskorch","Ceruledge","Cetitan","Darmanitan-Galarian","Dragonite","Frosmoth","Orbeetle","Salamence","Volcarona"],
    "Sky Pillar 2F": ["Banette","Gliscor","Kleavor","Mamoswine","Metagross","Sableye","Skeledirge","Sneasler","Tyranitar"],
    "Mt Chimney": ["Camerupt","Gliscor","Hakamo-O","Lycanroc-Dusk","Minior-Core-Indigo","Minior-Core-Orange","Pupitar","Scolipede","Typhlosion","Typhlosion-Hisuian","Weezing-Galarian"],
    "Southern Island Interior": ["Bagon","Deino","Dratini","Dreepy","Duraludon","Frigibax","Gible","Goomy","Jangmo-O","Latias","Latios","Swablu"],
    "Navel Rock Entrance": ["Crobat","Cyclizar","Flygon","Forretress","Gliscor","Kleavor","Mienshao","Minior-Core-Red","Persian-Alolan","Scizor"],
    "Navel Rock B1F": ["Ambipom","Banette","Grafaiai","Hawlucha","Liepard","Primarina","Salazzle","Samurott","Samurott-Hisuian","Swalot","Togekiss","Whimsicott"],
    "Navel Rock Fork": ["Audino","Bronzong","Carbink","Cofagrigus","Hatterene","Klefki","Orbeetle","Reuniclus","Spiritomb","Wyrdeer"],
    "Navel Rock Up 1": ["Altaria","Avalugg","Avalugg-Hisuian","Coalossal","Corviknight","Excadrill","Gliscor","Toedscruel","Togekiss","Torkoal"],
    "Verdanturf Tunnel B1F Tiny Room": ["Geodude","Geodude-Alolan","Klawf","Nacli","Rhyhorn","Roggenrola","Rolycoly"],
    "Aqua Hideout 1F": ["Basculegion","Basculegion-Female","Corsola-Galarian","Crawdaunt","Dragalge","Muk-Alolan","Overqwil","Sharpedo","Tentacruel","Toxapex"],
    "Victory Finale": ["Aerodactyl","Altaria","Beedrill","Blastoise","Chandelure","Charizard","Crawdaunt","Excadrill","Gallade","Garchomp","Gardevoir","Gliscor","Goodra-Hisuian","Heracross","Honchkrow","Kecleon","Lanturn","Lopunny","Mamoswine","Pinsir","Poliwrath","Walrein"],
    "Southern Island Exterior": ["Buneary","Chimchar","Hawlucha","Mankey","Meditite","Pawmo","Riolu","Sneasel-Hisuian","Terrakion","Timburr","Torchic"],
    "Navel Rock Up 2": ["Avalugg","Avalugg-Hisuian","Bastiodon","Crustle","Donphan","Forretress","Golem","Golem-Alolan","Magnezone","Probopass","Steelix"],
    "Navel Rock Up 3": ["Armaldo","Bombirdier","Bronzong","Carbink","Crustle","Druddigon","Lycanroc-Midnight","Meowstic","Meowstic-Female","Minior-Core-Red","Shuckle"],
    "Navel Rock Up 4": ["Alcremie","Altaria","Avalugg","Avalugg-Hisuian","Cradily","Garganacl","Gliscor","Hydrapple","Porygon2","Sableye","Togekiss"],
    "Navel Rock Down 01": ["Audino","Dachsbun","Espathra","Hitmontop","Klawf","Klefki","Obstagoon","Sableye","Stonjourner","Yanmega"],
    "Navel Rock Down 02": ["Amoonguss","Blastoise","Clefable","Lucario","Mr-Mime","Raichu","Raichu-Alolan","Shiinotic","Sinistcha","Toedscruel","Volcarona"],
    "Navel Rock Down 03": ["Bisharp","Cinderace","Grimmsnarl","Honchkrow","Lokix","Lycanroc-Dusk","Mawile","Obstagoon","Shiftry","Spiritomb"],
    "Navel Rock Down 04": ["Blastoise","Cyclizar","Diggersby","Hariyama","Hitmonchan","Hitmonlee","Infernape","Mr-Mime-Galarian","Palossand","Scrafty","Shiftry"],
    "Navel Rock Down 05": ["Armaldo","Cradily","Drapion","Escavalier","Falinks","Klawf","Meganium","Perrserker","Pupitar","Sliggoo-Hisuian","Torterra","Turtonator"]
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATIONS LIST
// Derived from the keys of locationEncounters so order is always preserved.
// Object.keys() in modern JS preserves insertion order for string keys.
// ─────────────────────────────────────────────────────────────────────────────
const locations = Object.keys(locationEncounters);

// ─────────────────────────────────────────────────────────────────────────────
// POKEMON NAME → POKEAPI ID LOOKUP
// Used to fetch sprites. Names are lowercased for matching.
// Pokémon not in this map will still appear in dropdowns but won't show a sprite.
// ─────────────────────────────────────────────────────────────────────────────
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
    "bronzong":437,"bronzor":436,"budew":406,"buizel":418,"bulbasaur":1,
    "buneary":427,"bunnelby":659,"butterfree":12,"buzzwole":794,"capsakid":1019,
    "carbink":703,"camerupt":323,"carkol":838,"carracosta":565,"carvanha":318,
    "castform":351,"caterpie":10,"celesteela":797,"centiskorch":851,
    "ceruledge":937,"cetitan":975,"cetoddle":974,"chandelure":609,"chansey":113,
    "charcadet":935,"charjabug":737,"charmander":4,"charmeleon":5,"charizard":6,
    "chespin":650,"chewtle":833,"chikorita":152,"chimchar":390,"chimecho":358,
    "chinchou":170,"clamperl":366,"clauncher":692,"claydol":344,"clefable":36,
    "clefairy":35,"cleffa":173,"cloyster":91,"clodsire":980,"coalossal":839,
    "cobalion":638,"cofagrigus":563,"combee":415,"copperajah":879,"corphish":341,
    "corsola":222,"corsola-galarian":222,"corviknight":823,"corvisquire":822,
    "cottonee":546,"crabrawler":739,"cradily":346,"cranidos":408,"crawdaunt":342,
    "cresselia":488,"crobat":169,"croagunk":453,"crustle":558,"cubchoo":613,
    "cubone":104,"cufant":878,"cursola":864,"cutiefly":742,"cyclizar":1005,
    "cyndaquil":155,"dachsbun":927,"darmanitan":555,"darmanitan-galarian":555,
    "darumaka":554,"dartrix":724,"decidueye":724,"decidueye-hisuian":724,
    "deino":633,"delcatty":301,"dewgong":87,"dewpider":751,"dhelmise":781,
    "diancie":719,"diggersby":660,"dipplin":1011,"dolliv":1008,"donphan":232,
    "dondozo":977,"doublade":680,"dracovish":882,"dracozolt":880,"dragalge":691,
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
    "fletchling":661,"flittle":955,"floatzel":419,"floette":670,"flutter-mane":987,
    "flygon":330,"foongus":590,"forretress":205,"fortree":0,"froslass":478,
    "froakie":656,"frosmoth":873,"fraxure":611,"frigibax":996,"fuecoco":909,
    "gallade":475,"galvantula":596,"garchomp":445,"gardevoir":282,"garganacl":968,
    "gastly":92,"gastrodon":423,"gengar":94,"geodude":74,"geodude-alolan":74,
    "gholdengo":1000,"gible":443,"gigalith":526,"gimmighoul":999,"girafarig":203,
    "glameow":431,"glimmora":970,"gliscor":472,"glimmet":969,"gloom":44,
    "golem":76,"golem-alolan":76,"golisopod":768,"golurk":623,"goodra-hisuian":706,
    "goomy":704,"gossifleur":829,"grafaiai":960,"granbull":210,"graveler-alolan":75,
    "great-tusk":984,"greavard":1013,"grimmsnarl":861,"grimer-alolan":88,
    "grotle":388,"grookey":810,"grubbin":736,"gurdurr":533,"gyarados":130,
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
    "lapras":131,"latias":380,"latios":381,"leavanny":542,"liepard":510,
    "lileep":345,"lillipup":506,"linoone-galarian":264,"litleo":667,"litten":725,
    "lokix":952,"lombre":271,"lopunny":428,"lotad":270,"lucario":448,
    "ludicolo":272,"lumineon":457,"lunatone":337,"luvdisc":370,"luxio":404,
    "lycanroc-dusk":745,"lycanroc-midnight":745,"magby":240,"magcargo":219,
    "magikarp":129,"magneton":82,"magnezone":462,"makuhita":296,"malamar":687,
    "mamoswine":473,"mandibuzz":630,"manectric":310,"mankey":56,"mantine":226,
    "mantyke":458,"mareanie":747,"mareep":179,"marshadow":802,"marowak":105,
    "masquerain":284,"maschiff":1013,"mawile":303,"medicham":308,"meditite":307,
    "meganium":154,"meowscarada":908,"meowth":52,"meowth-alolan":52,
    "meowth-galarian":52,"meowstic":678,"meowstic-female":678,"mesprit":481,
    "metang":375,"metagross":376,"mienfoo":619,"mienshao":620,"milcery":868,
    "milotic":350,"mime-jr":439,"mimikyu":778,"minior":774,"minior-core-blue":774,
    "minior-core-green":774,"minior-core-indigo":774,"minior-core-orange":774,
    "minior-core-red":774,"misdreavus":200,"mismagius":429,"morpeko":877,
    "morelull":755,"morgrem":860,"mr-mime":122,"mr-mime-galarian":122,
    "mudkip":258,"mudbray":749,"muk-alolan":89,"munchlax":446,"murkrow":198,
    "nacli":966,"naclstack":967,"naganadel":804,"natu":177,"nidoran-f":29,
    "nidoran-m":32,"nincada":290,"ninjask":291,"noibat":714,"noivern":715,
    "nosepass":299,"numel":322,"nuzleaf":274,"nymble":951,"obstagoon":862,
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
    "seismitoad":537,"seel":86,"serperior":497,"sewaddle":540,"sharpedo":319,
    "shaymin":492,"shellder":90,"shellos":422,"shelmet":616,"shieldon":410,
    "shiinotic":756,"shiftry":275,"shroodle":944,"shroomish":285,"shuckle":213,
    "shuppet":353,"sigilyph":561,"sinistcha":1013,"sinistea":854,"sizzlipede":850,
    "skeledirge":911,"skarmory":227,"skitty":300,"skrelp":690,"skorupi":451,
    "sliggoo-hisuian":705,"slowbro":80,"slowbro-galarian":80,"slowking":199,
    "slowking-galarian":199,"slowpoke":79,"slowpoke-galarian":79,"slugma":218,
    "smoliv":1007,"snivy":495,"sneasel":215,"sneasel-hisuian":215,"sneasler":903,
    "snom":872,"snorlax":143,"snorunt":361,"snover":459,"snubbull":209,
    "sobble":816,"solrock":338,"spinda":327,"spiritomb":442,"spheal":363,
    "sprigatito":906,"stakataka":805,"stantler":234,"staraptor":398,"starly":396,
    "starmie":121,"staryu":120,"steelix":208,"stonjourner":874,"stoutland":508,
    "stufful":759,"stunfisk":618,"stunfisk-galarian":618,"stunky":434,
    "surskit":283,"swablu":333,"swadloon":541,"swampert":260,"swanna":581,
    "swalot":317,"tadbulb":938,"tangela":114,"tangrowth":465,"talonflame":663,
    "tatsugiri":978,"tatsugiri-droopy":978,"tatsugiri-stretchy":978,
    "tapu-bulu":788,"tapu-koko":785,"tauros":128,"tauros-paldean":128,
    "tauros-paldean-aqua-breed":128,"tauros-paldean-blaze-breed":128,
    "teddiursa":216,"tentacool":72,"tentacruel":73,"tepig":498,"terrakion":639,
    "timburr":532,"tinkatink":957,"tinkatuff":958,"tinkaton":959,"toedscool":1001,
    "toedscruel":1002,"togedemaru":777,"togepi":175,"togekiss":468,"togetic":176,
    "torchic":255,"torkoal":324,"tornadus":641,"torracat":726,"torterra":389,
    "totodile":158,"toxapex":748,"toxel":848,"trapinch":328,"treecko":252,
    "turtwig":387,"turtonator":776,"tympole":535,"typhlosion":157,
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
    if (!id) return null;                         // not found → no sprite
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

// Build the main encounter tracking interface
function buildEncounterInterface() {
    const container = document.getElementById('encounterColumns');
    if (!container) return;

    // Split locations into two columns
    const midpoint = Math.ceil(locations.length / 2);
    const leftColumnLocations = locations.slice(0, midpoint);
    const rightColumnLocations = locations.slice(midpoint);
    const columns = [leftColumnLocations, rightColumnLocations];

    columns.forEach((columnLocations, columnIndex) => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'encounter-column';
        columnDiv.setAttribute('data-column', columnIndex);

        columnLocations.forEach((location) => {
            const encounterRow = createEncounterRow(location);
            columnDiv.appendChild(encounterRow);
        });

        container.appendChild(columnDiv);
    });

    // Restore UI state after DOM is built
    setTimeout(() => {
        restoreUIState();
    }, 100);
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
        option.value = pokemonName;                          // stored value
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

    koControls.appendChild(koPercent);
    koTracker.appendChild(koLabel);
    koTracker.appendChild(koControls);

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

// --- IMPROVED CHART.JS IMAGE AXIS LABELS PLUGIN ---
const pokemonImagePlugin = {
    id: 'pokemonImagePlugin',
    afterDraw: function(chart) {
        const yAxis = chart.scales.y;
        const ctx = chart.ctx;
        
        if (!yAxis || !chart.pokemonImages) return;
        
        // Get the chart data to determine positioning
        const chartData = chart.data.datasets[0].data;
        
        chart.pokemonImages.forEach((pokemonId, index) => {
            if (!pokemonId || !pokemonImageCache[pokemonId]) return;
            
            const img = pokemonImageCache[pokemonId];
            
            // Calculate Y position for this bar
            const imageSize = 40; // size of pokemon sprite
            const xPos = yAxis.left - imageSize - 12; // 12px padding from axis
            const yPos = yAxis.getPixelForValue(index);

            ctx.save();
            ctx.beginPath();
            ctx.arc(xPos + imageSize/2, yPos, imageSize/2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, xPos, yPos - imageSize/2, imageSize, imageSize);
            ctx.restore();
            
            // Draw the Pokémon image
            ctx.drawImage(
                img, 
                xPos, 
                yPos - imageSize/2, 
                imageSize, 
                imageSize
            );
            
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
                    left: 60 // Make room for Pokémon images
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

    // Resize and update
    koChart.resize();
    koChart.update();
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