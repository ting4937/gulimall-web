class UnicodeWebpackPlugin{
	apply(compiler) {
		compiler.hooks.emit.tap('UnicodeWebpackPlugin', compilation=>{
			for(let filename in compilation.assets){
				if(filename.slice(-4)=='.css'){
					let css=compilation.assets[filename].source();
					if(Buffer.isBuffer(css))
						continue;
					css=this.gbkToUnicode(css);
					compilation.assets[filename]={
						source:()=>{
							return css
						},
						size:()=>{
							return css.length;
						}
					};
				}
			}
		})
	}
	gbkToUnicode(content) {
		return content.replace(/([\u0080-\uffff])/g, (str) => {
			let hex = str.charCodeAt(0).toString(16);
			for (let i = hex.length; i < 4; i++) { 
				hex = '0' + hex;
			}
			return '\\' + hex;
		});
	}
}

module.exports=UnicodeWebpackPlugin;