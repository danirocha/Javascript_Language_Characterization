package main;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainProgrammer {
	
	private static final String DIRETORIO = "C:\\Users\\luisb\\Desktop\\novosTestes\\results\\832";
	
	private static int nBibliotecas = 0;
	
	private static String[] bibliotecasRejeitar = {"stream-combiner2",
			"nodegit-promise",
			"normalize-scss",
			"strong-swagger-ui",
			"bootstrap-sweetalert",
			"findit2",
			"jellypromise",
			"swig-templates",
			"@hola.org/video.js",
			"ciena-graphlib",
			"tinycache",
			"jsdom-no-contextify",
			"react-tag-autocomplete",
			"chen-typescript",
			"redux-ab-test",
			"glob2",
			"can-simple-dom",
			"simple-text-buffer",
			"min-documentx",
			"smb-react-selection",
			"node-oauth-1.0a",
			"@trails/generator-node",
			"sentence-case-without-digits",
			"litecore",
			"diceware-generator-grempe",
			"grid-react-select",
			"node-loggly-bulk",
			"remove-whitespace",
			"es6-promise-min",
			"bitcore-lib-dash",
			"virtual-domx",
			"homematic-xmlrpc",
			"node-fetch-polyfill",
			"comb-redis",
			"3f335bcfd286030b4771414e30b0582c84dc12000efa5ad019765ec55339860d",
			"filesizegzip",
			"pretty-byte",
			"confidence.js",
			"b-cdnizer",
			"css-b64-images-no-limit",
			"nw-gyp",
			"electron-ref-struct",
			"vec3.c",
			"electron-ref",
			"quat.c",
			"mat4.c",
			"d3-util",
			"jsdom-light",
			"jsdom-se",
			"sitecore-ui",
			"bson-ext2",
			"flocon-new",
			"jsdom-little",
			"edge-asar-cs",
			"grunt-w3c-html-validation",
			"grunt-nuget3-install",
			"@smartface/smartface.ide.collab",
			"jsdom-nogyp",
			"xmldom2",
			"johnny-five-electron",
			"yodel-gcm",
			"grunt-w3c-validation",
			"ccap-dev",
			"i2c-lcd",
			"custom-elements",
			"exiv2-buffers",
			"pdf-w3cvalidator",
			"bindings-shyp",
			"mostly-pangyp",
			"notnode-gyp",
			"w3cvalidator",
			"bno055",
			"cylon-firmata-llwoll",
			"pisky-mpu9150",
			"ccap-x",
			"meteor-react-ssr-jsdom",
			"cheers2",
			"xmldom-silent",
			"avronode-run",
			"ember-cli-c3-json",
			"ezcompilex",
			"jaydata-genx",
			"bolt-ccap",
			"terriajs-cesium",
			"pop-nvd3",
			"zombiej-nvd3",
			"nvd3-nb",
			"angular-nvd3-nb",
			"qrcodeine",
			"@studiomoniker/point",
			"gamefroot-texture-packer",
			"gulp-rev-last",
			"prism-nvd3",
			"x-dts-generator",
			"dbfkit-fork",
			"@grove/dogstatsd",
			"node-dogstatsd",
			"gulp-rev-qv",
			"@yavuzmester/grouped-bar-chart-vertical",
			"collectd-protocol",
			"easel-js",
			"periodicjs.theme-component.navigation-header",
			"biojs-vis-scatter-plot",
			"pop-react-nvd3",
			"react-nvd3-roadcert-edition",
			"generator-p5js",
			"gl-skydome-sun",
			"phaser-shim-p2",
			"ows-paper",
			"pn-dagre-d3",
			"react-atv",
			"unity-solution-2",
			"react-atv-img-fixed",
			"ts-package-lint",
			"bevspot-react-nvd3",
			"dogstatsd-node",
			"dogstatsd",
			"node-glfw-2",
			"abdogstatsd",
			"gulp-translator-d",
			"blobify",
			"sea-d44-fizz-buzz-mb",
			"sea-d44-fizz-buzz-sk",
			"sea-d44-fizz-buzz-zg",
			"sea-d44-fizz-buzz-at",
			"sea-d44-fizz-buzz-ls",
			"sea-d44-fizz-buzz-ch",
			"sea-d44-fizz-buzz-bg",
			"spritesmith-texturepacker-array",
			"sea-d44-fizz-buzz-hl",
			"node-dbf-carevoyance",
			"react-charts-plus",
			"sea-d44-fizz-buzz-mk",
			"statsd-influxdb-furu",
			"dbf-parser",
			"ciplogic-dts-generator",
			"statsd-http-backend",
			"dependito",
			"simplify-base",
			"cordova-plugin-cszbar-d",
			"nativescript-slides-d4w",
			"rd3_poc_mb",
			"barcode-generator",
			"aws-cloudwatch-statsd-backend-multiregion",
			"material-ui-ty-fork",
			"@safefood360/cqrs-domain",
			"bevspot-nvd3",
			"threejs-transformcontrols",
			"react-easy-chart-jacktasia-fork",
			"@hvent/gulp-rev",
			"rd3-bar-domain",
			"nvd3-revlucio",
			"d3-gauge-x",
			"d3-sankey-node-order",
			"sea-d44-fizz-buzz-jn",
			"three.js-xdomain",
			"obelisk-browserify",
			"obelisk.js-browserify-test",
			"ctx-get-transform-bugfix",
			"dbus-promised",
			"objtojs-oculushut",
			"statsd-datadog-backend-50",
			"gama-cocos-builder",
			"amqp-node",
			"fold-case",
			"enumify2",
			"officegen-complex-table",
			"forever-cluster",
			"insight-keen-io",
			"@kauabunga/officegen",
			"protractor-dev",
			"libphonenumber2",
			"gulp-amd-optimize",
			"safe-copy-paste",
			"fubarino-io",
			"ebay-apis",
			"copy-paste-win32fix",
			"protractor-elementor",
			"unpathify-alt",
			"joadr-officegen",
			"gulp-custom-rev",
			"gulp-rev-forcerev",
			"node-u2f",
			"tourgent-ember-g-map",
			"pagerank-cn",
			"loc",
			"ember-cli-g-maps-alt",
			"clx-h5psd",
			"generator-webappsf",
			"generator-jekyllrb-react",
			"generator-vision",
			"generator-js-sandbox",
			"slush-prototyper",
			"generator-leswigul",
			"generator-simpler-gulp-webapp",
			"@rowanmanning/rconsole",
			"nrconsole",
			"angularfire2-cocept",
			"h-swal",
			"@fabien0102/angularfire2",
			"i18nline",
			"szn-intl-polyfill",
			"resmio-intl-tel-input",
			"po2json-js",
			"outlinejs-babel-jsxgettext",
			"imacros-promise-polyfill",
			"react-intl-es6",
			"busbud-passbook",
			"react-intl-redux-immutable",
			"ng2-i18next-fork",
			"i18n-2",
			"grunt-atlas-multi-lang",
			"fcm-node",
			"i18next-resource-store-loader-yaml",
			"@pod-point-open-source/react-native-swipeout",
			"react-mobile-picker2",
			"fcm-push-notif",
			"ya-grunt-i18next-conv",
			"cordova-media-with-compression-ios-webaudio",
			"globalcache",
			"com.peerio.cordova.plugin.social",
			"nativescript-web-image-cache-with-fresco",
			"@grove/react-i13n-ga",
			"react-native-intl-plus",
			"i18n-factory",
			"@mdluo/react-native-gifted-listview",
			"designmonkey-react-native-gifted-listview",
			"react-native-mobile-browser",
			"lineapro-phonegap-plugin-hmt",
			"er-intl",
			"er-react-intl",
			"react-intl-custom",
			"grunt-hs-i18next-conv",
			"cordova-plugin-push-notification-cgvak",
			"i18n-abide-plurals",
			"cordova-plugin-mediapicker-unofficial",
			"promisified-rest-client",
			"grunt-template-runner-custom",
			"cordova-privacy-screen-plugin-mra",
			"teeleader-icalendar",
			"giant-i18n",
			"ircb.io",
			"node-itach",
			"gulp-text-translator",
			"grunt-multi-lang-site-generator",
			"device-detect.js",
			"i18n-mongoose",
			"cordova-plugin-analytics-pgp",
			"k-i18n",
			"grunt-gettext-static-build",
			"react-native-animated-swipeout",
			"gulp-i18n-localize-windows-compatible",
			"nativescript-pdf-view-bundling-enabled",
			"ics2.0",
			"cordova-plugin-cookiemaster",
			"searchitunes-fruktorum",
			"hernanex3-grunt-static-i18n",
			"react-picker-mobile",
			"cordova-plugin-pin-dialog-et",
			"react-select-i188",
			"xenious-cordova-plugin-x-socialsharing",
			"zhoujianhui-cordova-plugin-sms",
			"ember-cli-icheck-1.1",
			"grunt-cellarise-findatag",
			"grunt-cellarise-makara",
			"cordova-base64-image-saver",
			"i18n-moustache",
			"object-assign-shim",
			"whet.extend",
			"chai-cheerio",
			"bc-zepto.full",
			"jh-bunyan",
			"rv-ember-select-2",
			"generator-jquery-clivewalkden",
			"log4js_tc",
			"@orkisz/angular2-logger",
			"jquery-accessible-tabs-umd",
			"react-toastr-redux",
			"featherlight-webpack",
			"owlcarousel-umd-webpack",
			"konishileedistpicker",
			"urianchor",
			"rangeslider.js-mini",
			"log-4js",
			"bootstrap-rating-input-nj",
			"clockpicker-duration",
			"react-chosen-r",
			"shopify-jquery-minicolors",
			"owlcarousel-umd",
			"jquery-facedetection",
			"herzinger-ngsticky-fork",
			"ngsticky",
			"history.js",
			"spyquery",
			"log4js-node-andyliao",
			"neo4j-swagger-ui",
			"crawler-hq",
			"medium-editor-insert-plugin-webpack",
			"jquery.event.drag",
			"node-jquery-deparam",
			"multiple-select-prog666",
			"jquery.counterup",
			"touchswipe",
			"jquery-cloud-file-upload-middleware",
			"jquery-s3-file-upload-middleware",
			"counterupplusway",
			"wsscraper",
			"bootstrap-rating-nj",
			"@dg3feiko/blueimp-file-upload",
			"jquery-lazyload-commonjs",
			"euler-table",
			"jquery.localscroll-peer",
			"jquery.scrollto-peer",
			"ember-cli-tooltipster-stylefix",
			"bs-validator",
			"simpler-sidebar-evergreen",
			"split-pane",
			"jqueryify2",
			"flake-idgen-63",
			"k-before-unload",
			"cytoscape-afrivera",
			"node-l",
			"levenshtein-steps",
			"pw-transifex",
			"gulp-l10n-toolkit",
			"rf-nrf24",
			"gulp-contains-lexpress",
			"leaf-mdns",
			"loopbacknext",
			"@chovy/m3u8",
			"music-metadata",
			"generator-iac",
			"m3u8_to_mpegts",
			"coap-cbor-cli",
			"mvp-expansions",
			"nmos-mdns-js",
			"activedirectory2",
			"unomp-multi-hashing",
			"react-file-dropzone",
			"robb-clone",
			"oembed-providers-unofficial",
			"oembed-auto-gc",
			"@jamie452/oembed",
			"xmldom-xpath-wrapper",
			"tr-O64",
			"phash-image",
			"bitcore-p2p-dash",
			"litecore-p2p",
			"rawcore-p2p",
			"rawcore",
			"bitcore-dash",
			"less-mkdirp",
			"litecore-lib",
			"bitcore-lib-litecoin",
			"rawcore-lib",
			"wopenssl",
			"csc-bitcore",
			"nnupnp",
			"digicore-lib",
			"fritzbox",
			"clamcore",
			"get-telehash",
			"httpp-proxy",
			"wrtc-full",
			"canvas-phash-node-6",
			"digicore",
			"q-local",
			"web3-q",
			"q-io-local",
			"mongoose3-q",
			"rserve-js-v1",
			"rm-r",
			"ng-table-release",
			"grunt-annotated-requirejs",
			"node-teamspeak-fix",
			"grunt-bbb-requirejs",
			"amdetective-badoo",
			"blake2s",
			"parse-server-s3like-adapter",
			"wn-s3-uploader",
			"gulp-awspublish-regex-headers",
			"node-log-dissector",
			"bb-feathers-blob",
			"claudio",
			"wb-clean-css",
			"ghost-s3-compat",
			"component-helper",
			"ember-cli-deploy-s3-outstand",
			"ghost-s3-storage-adapter",
			"s3-sync-aws",
			"ghost-storage-s3",
			"mongo-shard-s3-backup",
			"@timothygu/terminal-menu",
			"promises-aplus-tests-phantom",
			"ghost-dreamobjects-storage",
			"ghost-s3-service",
			"blanksby-node-orvibo",
			"hexo-deployer-s3-cloudfront",
			"grunt-aws-s3-gzip",
			"connect-favicons-pro",
			"gulp-css-iconfont",
			"homebridge-http-jeedom",
			"moin.js",
			"bizzby-ciao",
			"s3_backup",
			"grunt-pure-s3",
			"terminal-menu-2",
			"grunt-awssum-deploy-branch",
			"express-cdn-wip",
			"multer-s3-acl",
			"string-russian",
			"@aftership/grunt-aws-s3",
			"panbhag-alleup",
			"toobusy-js",
			"zetzer",
			"pirxpilot-async-cache",
			"@mallzee/serverless",
			"must-fit",
			"bunyan-noop",
			"homebridge-mqttlightbulb",
			"nba-hack",
			"react-native-common-item-cell",
			"gulp-dot-precompiler2",
			"lingon-ng-html2js",
			"gulp-ng-html2js-lienbcn",
			"jsonresume-theme-kwan-fix",
			"json_prune",
			"@koding/bant",
			"dot-include",
			"chuckt_redis",
			"express3-dot",
			"dot-compiler",
			"sams-mongo-lazy",
			"@arilotter/tsne-js",
			"profanityfilter",
			"gulp-ng-html2js-de",
			"library-utorrent",
			"react-quill-v2",
			"v8-promise-module",
			"yelp-v3",
			"node-uuid",
			"coffee-reactify",
			"csc-bitcore-v0.1",
			"gcstats.js",
			"pugify-misskernel",
			"passport-youtube-v3-playlists",
			"babylone-repo-react-cookie-banner",
			"google-adwords-reports",
			"ehealth-box-appauth",
			"yelp-api-v3",
			"babel-plugin-source-map-support-for-6",
			"gulp-resource-hash",
			"@paulcbetts/gc",
			"material-ui-ie",
			"find-exec-v12",
			"angular-uuid",
			"octonode2",
			"generator-aspnet-xtianus",
			"msgpack-js-v5-ng",
			"refcoffeeify",
			"mercury-jsxify",
			"reactiscriptsixify",
			"troupe-octonode",
			"cssify2",
			"node-foursquare-plaid",
			"sharelib-tmdbv3",
			"foursquare-js",
			"material-ui-with-sass",
			"benchmark-octane2",
			"freeway.io",
			"simple-profiler",
			"dora-plugin-proxy-cors",
			"fis3-parser-less-2.x",
			"cordova-plugin-local-notifications-san",
			"zuzel-printer",
			"phonegap-plugin-push-without-android-support-v13",
			"gw2nodemst",
			"octonode-nick",
			"hamlify",
			"octonode-baseurl",
			"node-foursquare-2",
			"stack-access",
			"express-x-hub-bigint",
			"@glenjamin/inspect-x",
			"node-notifier-allowed-in-mac-app-store",
			"fluentcv",
			"vrrv-installer-builder",
			"ejs-mate-gunmetal313",
			"bitxplus",
			"ngts-annotations",
			"generator-wbelement",
			"serverless-plugin-dotenv",
			"ais-ejs-mate",
			"base-x-native",
			"babel-preset-node6",
			"ejs-mate-var",
			"react-native-xml-crypto",
			"xenious-cordova-plugin-x-toast",
			"px2rem-reloaded",
			"gl-mat4-esm",
			"working-x-ray",
			"babel-preset-node6-es6",
			"parse-x509",
			"atm4-spriter-csssprites",
			"latex-file",
			"vw-socket.io-memcached",
			"electron-mac-notifier",
			"ldapjs-hotfix",
			"x.509",
			"hogan-express-strict",
			"xml-crypto-pp",
			"ejs-locals",
			"titlebar-react",
			"zotero-bibtex-parse",
			"node-x11-hash-algo",
			"ejs-locals-custom",
			"jw-ng-forward",
			"@sethb0/koa-helmet",
			"zappajs-partials",
			"shackbarth-test",
			"@neeharv/react-tabs",
			"react-pick-2",
			"grunt-mocha-test-y",
			"pitaya-web-tabs",
			"ss-react-tabs",
			"axe-core-req",
			"pop3swift",
			"serverless-z",
			"es-7z",
			"irrelonopenzwave",
		};
	
	public static void main(String[] args) throws Exception {
		
		List<Biblioteca> bibliotecas = new BibliotecaDAO().pegaBibliotecas();
			
		//BufferedWriter bw = createBat();
//		BufferedWriter bw2 = createBat2();
		//BufferedWriter bwLog = createLog();
	
		//readDirectory(DIRETORIO, bw, bibliotecas);
		
		//bw.write("echo Analyzes done!");
		//bw.close();
		//bwLog.close();
		
		//CSVCreator creator = new CSVCreator();
		//creator.createFile(DIRETORIO, bibliotecas, bibliotecasRejeitar);
		
//		searchDirectory(bibliotecas, bw2);
		
		//System.out.println("Deletando!");
		//DeleteFiles deleter = new DeleteFiles();
		//deleter.deleteFiles();
		
		//System.out.println("Gerando CSV por Biblioteca!");
		//GeradorCSVBiblioteca gerador1 = new GeradorCSVBiblioteca();
		//gerador1.geraCSV();
		
		//System.out.println("Gerando CSV por Arquivo!");
		//GeradorCSVArquivo gerador2 = new GeradorCSVArquivo();
		//gerador2.geraCSV();
		
		System.out.println("Gerando CSV por Funcao!");
		GeradorCSVFuncao gerador3 = new GeradorCSVFuncao();
		gerador3.geraCSV();
		
		//GeradorCSVFuncaoEsprima gerador4 = new GeradorCSVFuncaoEsprima();
		//System.out.println("Gerando CSV por Funcao e No do Esprima!");
		//gerador4.geraCSV();
		
		//NewBat novoBat = new NewBat();
		//novoBat.geraBat(bibliotecas);
		
		//NovoBat bat = new NovoBat();
		//bat.geraBat(bibliotecas);
		
//		System.out.println(nBibliotecas);
		
		//numberOfPackages(DIRETORIO);
		
		//System.out.println(nBibliotecas);
		System.out.println("Fim!");
	}
	
	private static void searchDirectory(List<Biblioteca> bibliotecas, BufferedWriter bw) throws IOException {
		int numeroBibliotecas = 0;
		
		for(Biblioteca biblioteca : bibliotecas) {
			
			boolean achou = false;
			
			for(int indiceRejeitada = 0; indiceRejeitada < bibliotecasRejeitar.length; indiceRejeitada++) {
				if(bibliotecasRejeitar[indiceRejeitada].compareTo(biblioteca.getNome()) == 0) {
					achou = true; break;
				}
			}
			
			if(achou)
				continue;
			
			int numeroPasta = biblioteca.getId() % 1000;
			
			String pasta = biblioteca.getGithub().substring(biblioteca.getGithub().lastIndexOf("/") + 1);
			
			if(pasta.compareTo("") == 0)
			{
				pasta = biblioteca.getGithub().substring(0, biblioteca.getGithub().lastIndexOf("/"));
				pasta = pasta.substring(pasta.lastIndexOf("/") + 1);
			}
			
			String caminho = "C:\\Users\\luisb\\Desktop\\MAQUINAREMOTA\\dist\\dist\\" + numeroPasta + "\\" + pasta;
			File file = new File(caminho);
			
			if(file.exists())
				if(file.isDirectory())
				{
					bw.write("node analyzer.js " + caminho + " " + biblioteca.getId() + " " + biblioteca.getNome() + "\n");
					numeroBibliotecas++;
				}			
		}
		
		System.out.println(numeroBibliotecas);
	}

	private static BufferedWriter createBat() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization\\analyzer.bat";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
	
	private static BufferedWriter createBat2() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization\\analyzer2.bat";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
	
	private static BufferedWriter createLog() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization\\log.txt";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
	
	private static void readDirectory(String diretorio, BufferedWriter bw, List<Biblioteca> bibliotecas) throws IOException {
		
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
				
		for(int i = 0; i < arquivos.length; i++) {
			File arquivo = arquivos[i];
			
			Pattern pattern = Pattern.compile("C:\\\\Users\\\\luisb\\\\Desktop\\\\MAQUINAREMOTA\\\\dist\\\\dist\\\\(\\d+)$");
			Matcher match = pattern.matcher(arquivo.getAbsolutePath());
			
			if(match.find()) {
				File libs[] = arquivo.listFiles();
				
				for(Biblioteca biblioteca : bibliotecas) {
					
					if(biblioteca.getId() % 1000 != Integer.parseInt(match.group(1)))
						continue;
					
					for(int b = 0; b < libs.length; b++) {
						
						boolean achou = false;
						
						for(int indiceRejeitada = 0; indiceRejeitada < bibliotecasRejeitar.length; indiceRejeitada++) {
							if(bibliotecasRejeitar[indiceRejeitada].compareTo(biblioteca.getNome()) == 0) {
								achou = true; break;
							}
						}
						
						if(achou)
							break;
													
						String lib = libs[b].getAbsolutePath().substring(libs[b].getAbsolutePath().lastIndexOf("\\") + 1);
						Pattern pattern2 = Pattern.compile("/" + lib + "[.]*$");
						Matcher matcher = pattern2.matcher(biblioteca.getGithub());
											
						if(matcher.find()) {
							bw.write("node analyzer.js " + libs[b].getAbsolutePath() + " " + biblioteca.getId() + " " + biblioteca.getNome() + "\n");
							nBibliotecas++;
							break;
						}
					}
				}
			}
			
			else
				if(arquivo.isDirectory())
					readDirectory(arquivo.getAbsolutePath(), bw, bibliotecas);
		}
	}
	
	public static void numberOfPackages(String diretorio) {
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory()) {
				File[] bibliotecas = arquivo.listFiles();
				
				nBibliotecas += bibliotecas.length;
			}
		}
		
		System.out.println(nBibliotecas);
	}

}
