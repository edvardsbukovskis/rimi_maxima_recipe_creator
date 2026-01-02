import { Recipe } from '@/types';

export const RECIPES: Recipe[] = [
    {
        id: '1',
        title: 'Plānās Pankūkas',
        description: 'Klasiskās latviešu plānās pankūkas.',
        image: '/planas_pankukas.png',
        prepTime: '20 min',
        servings: 4,
        yieldDescription: '~12 pankūkas',
        yieldPerServing: '~3 pankūkas',
        instructions: [
            'Sagatavošana: Lielā bļodā iesit {amount:Olas} olas, pievieno {amount:Cukurs 1kg} cukura un šķipsniņu sāls. Kārtīgi sakuļ (apmēram 1-2 minūtes), līdz masa kļūst nedaudz gaisīga un cukurs ir izkusis.',
            'Mīkla: Pakāpeniski pievieno {amount:Kviešu milti 1kg} miltu. Pievieno apmēram trešdaļu miltu un nedaudz piena (no {amount:Piens 2%}), nepārtraukti maisot, lai neveidotos kunkuļi. Turpina šo procesu – pārmaiņus pievienojot miltus un pienu – līdz visas sastāvdaļas ir sajauktas gludā, šķidrā mīklā, kas pēc konsistences atgādina saldo krējumu.',
            'Atpūtināšana: Mīklu ieteicams atstāt istabas temperatūrā vismaz uz 15-20 minūtēm. Tas ļauj miltu lipeklim atslābt un cietes graudiem uzbriest, padarot pankūkas mīkstākas un izturīgākas.',
            'Cepšana: Uzkarsē pankūku pannu vai parasto pannu uz vidējas uguns. Ielej nelielu daudzumu eļļas (apmēram 1 tējk.) un izlīdzina pa visu pannu. Ja izmanto labu pretpiedeguma pannu, eļļa nepieciešama tikai pirmajai pankūkai.',
            'Cepšanas process: Ielej nelielu kausiņu (apm. 60-80ml) mīklas pannas centrā. Nekavējoties pacel un grozi pannu apļveida kustībām, lai mīkla vienmērīgi noklātu visu pannas virsmu.',
            'Apgriešana: Cep apmēram 1-2 minūtes. Kad pankūkas malas sāk izskatīties sausas un tās apakša ir zeltaini brūna, tā ir gatava apgriešanai. Uzmanīgi apgriez ar lāpstiņu un cep otru pusi vēl 30-60 sekundes.',
            'Pasniegšana: Noņem gatavo pankūku un liek uz šķīvja. Atkārto ar atlikušo mīklu. Pasniedz nekavējoties ar ievārījumu, skābo krējumu vai svaigām ogām.'
        ],
        ingredients: [
            { name: 'Piens 2%', amount: '500ml', amountValue: 500, amountUnit: 'ml' },
            { name: 'Olas', amount: '3 gab', amountValue: 3, amountUnit: 'gab' },
            { name: 'Kviešu milti', amount: '200g', amountValue: 200, amountUnit: 'g' },
            { name: 'Cukurs', amount: '30g', amountValue: 30, amountUnit: 'g' },
            { name: 'Rapšu eļļa', amount: '30ml', amountValue: 30, amountUnit: 'ml' },
            { name: 'Sāls', amount: '1g', amountValue: 1, amountUnit: 'g' }
        ]
    },
    {
        id: '2',
        title: 'Kartupeļu Pankūkas',
        description: 'Kraukšķīgas kartupeļu pankūkas ar krējumu.',
        image: '/kartupelu_pankukas.png',
        prepTime: '40 min',
        servings: 2,
        yieldDescription: '~8 pankūkas',
        yieldPerServing: '~4 pankūkas',
        instructions: [
            'Sagatavošana: Nomizo kartupeļus un nomazgā tos aukstā ūdenī. Sarīvē kartupeļus ar smalko rīvi lielā bļodā. Ja masa ir ļoti ūdeņaina, ieliec to tīrā virtuves dvielī un izspied lieko šķidrumu - tas palīdzēs pankūkām kļūt kraukšķīgākām.',
            'Mīklas gatavošana: Sarīvētajiem kartupeļiem pievieno {amount:Olas} olu, {amount:Kviešu milti 1kg} miltu, {amount:Sāls} sāls un šķipsniņu melno piparu. Visu kārtīgi samaisa viendabīgā masā. Miltus pievieno pakāpeniski - ja masa šķiet pārāk šķidra, pievieno vēl nedaudz miltu.',
            'Pannas sagatavošana: Lielā pannā uzkarsē aptuveni 1cm biezu eļļas slāni uz vidēji lielas uguns (apm. 170-180°C). Eļļa ir gatava, kad tajā iemests neliels kartupeļu gabaliņš sāk čurkstēt.',
            'Formēšana: Ar karoti vai rokām ņem aptuveni 2 ēdamkarotes kartupeļu masas un uzmanīgi liec karstajā eļļā. Ar karotes aizmuguri vai lāpstiņu nedaudz saplakini katru pankūku apmēram 1cm biezumā. Atstāj pietiekami daudz vietas starp pankūkām.',
            'Cepšana: Cep 3-4 minūtes no katras puses, līdz pankūkas ir zeltaini brūnas un kraukšķīgas. Apgriez uzmanīgi ar lāpstiņu. Ja pankūkas brūnē pārāk ātri, samazini uguni.',
            'Nosusināšana: Gatavas pankūkas noņem no pannas un liek uz papīra dvieļiem, lai nosūktos liekā eļļa. Pagatavo atlikušās pankūkas pa partijām.',
            'Pasniegšana: Pasniedz siltas ar {amount:Skābais krējums} krējumu. Vislabāk garšo tikko pagatavotas. Ja nepieciešams turēt siltas, liec cepeškrāsnī uz 80°C.'
        ],
        ingredients: [
            { name: 'Kartupeļi', amount: '1kg', amountValue: 1000, amountUnit: 'g' },
            { name: 'Olas', amount: '1 gab', amountValue: 1, amountUnit: 'gab' },
            { name: 'Kviešu milti', amount: '50g', amountValue: 50, amountUnit: 'g' },
            { name: 'Skābais krējums', amount: '200g', amountValue: 200, amountUnit: 'g' },
            { name: 'Rapšu eļļa', amount: '50ml', amountValue: 50, amountUnit: 'ml' },
            { name: 'Sāls', amount: '5g', amountValue: 5, amountUnit: 'g' },
            { name: 'Pipari melnie', amount: '1g', amountValue: 1, amountUnit: 'g' }
        ]
    },
    {
        id: '3',
        title: 'Mājas Lazanja',
        description: 'Klasiska itāļu lazanja ar gaļas ragū un bešamel mērci.',
        image: '/lazanja.png',
        prepTime: '90 min',
        servings: 6,
        yieldDescription: '~12 gabali',
        yieldPerServing: '~2 gabali',
        instructions: [
            'Gaļas mērce: Lielā pannā uzkarsē {amount:Rapšu eļļa 1l} eļļas un apcep {amount:Maltā gaļa} malto gaļu, līdz tā kļūst brūna. Pievieno sasmalcinātu sīpolu, {amount:Ķiploki} ķiploka daiviņas un cep vēl 5 minūtes.',
            'Tomātu pievienošana: Pievieno {amount:Tomātu pasta} tomātu pastas, 200ml ūdens, {amount:Sāls} sāls, piparus un 5g oregano. Vāra uz lēnas uguns 20-30 minūtes, lai mērce sabiezē.',
            'Bešamel mērce: Citā katlā izkausē {amount:Sviests} sviesta, pievieno {amount:Kviešu milti 1kg} miltu un maisa 2 minūtes. Pakāpeniski pievieno {amount:Piens 2%} pienu, nepārtraukti maisot, līdz mērce kļūst bieza un gluda.',
            'Bešamel garšošana: Bešamelei pievieno šķipsniņu muskatriekstu, sāli un piparus pēc garšas. Noņem no uguns.',
            'Cepšanas formas sagatavošana: Ieeļļo lielu cepamtrauku (apm. 25x35cm). Ieliec cepeškrāsni iepriekš uzkarsēties līdz 180°C.',
            'Kārtošana: Uz formas apakšas izklāj nedaudz gaļas mērces. Pārklāj ar lazanjas loksnēm. Pievieno kārtu gaļas mērces, tad bešamel, tad 50g rīvēta siera ({amount:Siers}). Atkārto 3-4 reizes.',
            'Pēdējā kārta: Pārliec ar pēdējām lazanjas loksnēm, pārklāj ar bešamel mērci un pārkaisa ar atlikušo rīvēto sieru ({amount:Siers}).',
            'Cepšana: Cep iepriekš uzkarsētā cepeškrāsnī 180°C temperatūrā 40-45 minūtes, līdz virsa ir zeltaini brūna un burbuļo.',
            'Atpūtināšana: Ļauj lazanjai atpūsties 10-15 minūtes pirms pasniegšanas - tas atvieglos sagriešanu un kārtas turēsies labāk.'
        ],
        ingredients: [
            { name: 'Maltā gaļa', amount: '500g', amountValue: 500, amountUnit: 'g' },
            { name: 'Lazanjas loksnes', amount: '250g', amountValue: 250, amountUnit: 'g' },
            { name: 'Tomātu pasta', amount: '400g', amountValue: 400, amountUnit: 'g' },
            { name: 'Piens 2%', amount: '600ml', amountValue: 600, amountUnit: 'ml' },
            { name: 'Siers', amount: '200g', amountValue: 200, amountUnit: 'g' },
            { name: 'Sviests', amount: '60g', amountValue: 60, amountUnit: 'g' },
            { name: 'Kviešu milti', amount: '60g', amountValue: 60, amountUnit: 'g' },
            { name: 'Sīpoli', amount: '150g', amountValue: 150, amountUnit: 'g' },
            { name: 'Ķiploki', amount: '10g', amountValue: 10, amountUnit: 'g' },
            { name: 'Rapšu eļļa', amount: '30ml', amountValue: 30, amountUnit: 'ml' },
            { name: 'Sāls', amount: '5g', amountValue: 5, amountUnit: 'g' },
            { name: 'Pipari melnie', amount: '2g', amountValue: 2, amountUnit: 'g' }
        ]
    },
    {
        id: '4',
        title: 'Mājas Burgeri',
        description: 'Sulīgi mājas burgeri ar svaigiem dārzeņiem.',
        image: '/burgeri.png',
        prepTime: '30 min',
        servings: 4,
        yieldDescription: '4 burgeri',
        yieldPerServing: '1 burgers',
        instructions: [
            'Kotlešu pagatavošana: Lielā bļodā sajauc {amount:Maltā gaļa} maltas liellopu gaļas ar {amount:Sāls} sāls, {amount:Pipari melnie} pipariem. Sadala {servings} vienādās daļās un veido apaļas kotletes, nedaudz plakanākas par maizīšu biezumu.',
            'Kotlešu formēšana: Ar īkšķi izveidojiet nelielu iedobumu katras kotletes centrā - tas novērsīs uzpūšanos cepšanas laikā.',
            'Cepšana: Uzkarsē pannu vai grilu uz augstas uguns. Cep kotletes 3-4 minūtes no katras puses, līdz iekšpusē sasniegta 70°C temperatūra.',
            'Siera pievienošana: Pēdējā cepšanas minūtē uzliec uz katras kotletes 1 siera šķēli un ļauj tai izkust.',
            'Maizīšu sagatavošana: Pārgriez burgeru maizītes uz pusēm un nedaudz apgrauzdē uz pannas vai grilā - tas piešķirs kraukšķīgumu.',
            'Mērces pagatavošana: Sajauc {amount:Majonēze} majonēzes ar {amount:Kečups} kečupa un {amount:Sinepes} sinepēm - tas būs burgera mērce.',
            'Dārzeņu sagatavošana: Sagriez tomātu plānās šķēlēs, sīpolu riņķos un sagatavo salātu lapas.',
            'Komplektēšana: Uz apakšējās maizītes uzziež mērci. Liec salātu lapu, kotleti ar sieru, tomātu šķēles, sīpola riņķus. Pārklāj ar augšējo maizīti.',
            'Pasniegšana: Pasniedz uzreiz ar frī kartupeļiem vai salātiem. Burgeri ir visgardākie tikko pagatavoti.'
        ],
        ingredients: [
            { name: 'Maltā gaļa', amount: '500g', amountValue: 500, amountUnit: 'g' },
            { name: 'Burgeru maizītes', amount: '4 gab', amountValue: 4, amountUnit: 'gab' },
            { name: 'Siers šķēlēs', amount: '120g', amountValue: 120, amountUnit: 'g' },
            { name: 'Tomāti', amount: '300g', amountValue: 300, amountUnit: 'g' },
            { name: 'Sīpoli', amount: '100g', amountValue: 100, amountUnit: 'g' },
            { name: 'Salāti', amount: '100g', amountValue: 100, amountUnit: 'g' },
            { name: 'Majonēze', amount: '60g', amountValue: 60, amountUnit: 'g' },
            { name: 'Kečups', amount: '20g', amountValue: 20, amountUnit: 'g' },
            { name: 'Sinepes', amount: '10g', amountValue: 10, amountUnit: 'g' },
            { name: 'Sāls', amount: '5g', amountValue: 5, amountUnit: 'g' },
            { name: 'Pipari melnie', amount: '2g', amountValue: 2, amountUnit: 'g' }
        ]
    },
    {
        id: '5',
        title: 'Pasta Carbonara',
        description: 'Itāļu klasika - krēmīga pasta ar bekonu un parmezānu.',
        image: '/carbonara.png',
        prepTime: '25 min',
        servings: 4,
        yieldDescription: '4 porcijas',
        yieldPerServing: '1 porcija',
        instructions: [
            'Ūdens uzvārīšana: Lielā katlā uzvāra daudz ūdens (apm. 4l). Pievieno {amount:Sāls} sāls - ūdenim jābūt sālītam kā jūrai.',
            'Bekona cepšana: Kamēr ūdens vārās, sagriez {amount:Bekons} bekona nelielās sloksnītēs. Cep lielā pannā uz vidējas uguns bez eļļas, līdz beekons kļūst kraukšķīgs (8-10 min).',
            'Olu maisījums: Bļodā sakuļ {amount:Olas} dzelteņus ar {amount:Cietais siers} rīvēta parmezāna siera, šķipsniņu piparu. Maisis līdz gludai masai.',
            'Pastas vārīšana: Vāra {amount:Spaghetti} spageti saskaņā ar norādījumiem uz iepakojuma, bet 1-2 minūtes īsāk (al dente). Pirms nokāš, saglabā 200ml pasta ūdens!',
            'Savienošana: Nokāš pastu un uzreiz pievieno pannā pie bekona. Noņem pannu no uguns! Tas ir ļoti svarīgi - uguns sabojās olas.',
            'Mērces pievienošana: Pievieno olu un siera maisījumu pastai ar bekonu. Ātri maisa, lai mērce vienmērīgi pārklāj pastu. Pievieno 50-100ml pasta ūdens, lai panāktu krēmīgu konsistenci.',
            'Pasniegšana: Uzreiz sadala pa šķīvjiem. Pārkaisa ar papildus cietais siers un svaigi maltiem pipariem. Pasniedz nekavējoties - carbonara negaida!'
        ],
        ingredients: [
            { name: 'Spaghetti', amount: '400g', amountValue: 400, amountUnit: 'g' },
            { name: 'Bekons', amount: '200g', amountValue: 200, amountUnit: 'g' },
            { name: 'Olas', amount: '4 gab', amountValue: 4, amountUnit: 'gab' },
            { name: 'Cietais siers', amount: '100g', amountValue: 100, amountUnit: 'g' },
            { name: 'Sāls', amount: '20g', amountValue: 20, amountUnit: 'g' },
            { name: 'Pipari melnie', amount: '3g', amountValue: 3, amountUnit: 'g' }
        ]
    }
];
