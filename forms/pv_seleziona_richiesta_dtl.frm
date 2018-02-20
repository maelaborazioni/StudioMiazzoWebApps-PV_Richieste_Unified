dataSource:"db:/ma_anagrafiche/ditte",
extendsID:"1133F786-74EC-471A-9E2C-FA93A0CCB231",
initialSort:"codice asc",
items:[
{
dataProviderID:"vAnno",
displayType:2,
formIndex:10,
format:"####|####|#(4)",
location:"430,20",
name:"fld_anno",
onActionMethodID:"-1",
onDataChangeMethodID:"1C5E21B8-6002-495C-859F-C3213E64CA43",
size:"60,20",
tabSeq:3,
typeid:4,
uuid:"15BFC1CB-1270-4957-9785-25604A36A9AD",
valuelistID:"E4C2A26B-BCEB-4126-90DC-9F6E293CBA89"
},
{
formIndex:17,
labelFor:"fld_codgruppolavoratori",
location:"170,40",
mediaOptions:14,
name:"lbl_gruppolavoratori",
size:"110,20",
text:"Gruppo di lavoratori",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"2718B579-713F-461F-8DB6-8D9664DCF86F"
},
{
dataProviderID:"vMese",
displayType:2,
editable:false,
formIndex:11,
format:"0",
location:"340,20",
name:"fld_mese",
onActionMethodID:"-1",
onDataChangeMethodID:"-1",
size:"80,20",
tabSeq:2,
typeid:4,
uuid:"2F79724B-A0E3-41B3-BBE8-BE1AC533BB9B",
valuelistID:"28CE7D60-C21D-4B3C-964C-8C58574437DA"
},
{
customProperties:"methods:{\
onActionMethodID:{\
arguments:[\
null,\
\"false\"\
]\
}\
}",
formIndex:2,
horizontalAlignment:0,
labelFor:"fld_codgruppolavoratori",
location:"220,60",
mediaOptions:2,
name:"btn_gruppolavoratori",
onActionMethodID:"0ECE224F-3E21-4C2D-92AD-C702C66C7E70",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
rolloverCursor:12,
showClick:false,
size:"20,20",
styleClass:"btn_lookup",
tabSeq:-2,
transparent:true,
typeid:7,
uuid:"3C8FE6D6-3535-4700-B9C4-5AE1F8AE3CBF",
verticalAlignment:0
},
{
dataProviderID:"ragionesociale",
editable:false,
enabled:false,
formIndex:6,
location:"80,20",
name:"fld_ragionesociale",
size:"250,20",
tabSeq:-2,
text:"Ragionesociale",
typeid:4,
uuid:"3C923124-34E1-4A6E-A218-00110E09A29A"
},
{
extendsID:"A248BFB3-52A0-4525-98C8-5C43ED80D0BF",
height:210,
typeid:19,
uuid:"562A2DE5-4BBA-4E60-B7B1-6C3642A2D576"
},
{
height:160,
partType:5,
typeid:19,
uuid:"596A1704-D312-4D90-A52C-DA960D0E96BC"
},
{
customProperties:"",
formIndex:7,
horizontalAlignment:0,
labelFor:"fld_codditta",
location:"60,20",
mediaOptions:2,
name:"btn_codditta",
onActionMethodID:"FCF17708-BDAE-4B75-8A67-E5A3D3A87E27",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
rolloverCursor:12,
showClick:false,
size:"20,20",
styleClass:"btn_lookup",
tabSeq:-2,
transparent:true,
typeid:7,
uuid:"6E3B2047-AFE3-463E-9502-C80471D18A51",
verticalAlignment:0
},
{
anchors:6,
location:"460,150",
mediaOptions:2,
mnemonic:"",
name:"btn_annullaselgiorn",
onActionMethodID:"EEBCA54A-71AE-44E5-A33D-695B625216C2",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
rolloverCursor:12,
showClick:false,
size:"30,30",
styleClass:"btn_cancel_40",
tabSeq:-2,
transparent:true,
typeid:7,
uuid:"73E15682-BCF0-4A10-98A9-77D77A503567"
},
{
formIndex:16,
labelFor:"rad_tiporichiesta",
location:"340,80",
mediaOptions:14,
name:"lbl_tiporichiesta",
size:"80,20",
text:"Tipo richiesta",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
typeid:7,
uuid:"74C1A5C2-180F-4E98-A046-D7B954D9B897"
},
{
extendsID:"AAAC08F8-0270-4E48-995F-E7066E036521",
height:190,
typeid:19,
uuid:"74D0ADCB-9A63-4170-A297-EE20522F9EB9"
},
{
extendsID:"24B81C90-FFDE-4CA0-8622-BBF835989F6D",
formIndex:0,
location:"0,190",
size:"500,20",
typeid:7,
uuid:"75493608-5A8E-4D3C-9D7D-05F92131DEDF"
},
{
dataProviderID:"vTipoRichiesta",
displayType:3,
formIndex:17,
location:"340,100",
name:"rad_tiporichiesta",
scrollbars:36,
size:"150,40",
styleClass:"radio",
tabSeq:7,
transparent:true,
typeid:4,
uuid:"7ACC442E-D259-47C8-A0F3-44C7B546D5FE",
valuelistID:"9DEF12DE-9008-4DF5-8BCF-99C219118F4F"
},
{
dataProviderID:"vCategoriaRichiesta",
displayType:2,
editable:false,
formIndex:10,
location:"10,60",
name:"fld_categoriarichiesta",
onActionMethodID:"-1",
onDataChangeMethodID:"848CF856-C607-4F22-8FD0-E499C98A7892",
size:"150,20",
tabSeq:4,
typeid:4,
uuid:"8367EDA0-C83E-4B69-9246-CA6AF030C941",
valuelistID:"FD541200-D3EE-457F-AF43-E11FAAEEF5F8"
},
{
dataProviderID:"vCompanyCode",
formIndex:5,
format:"#####|#(5)",
horizontalAlignment:0,
location:"10,20",
name:"fld_codditta",
onActionMethodID:"4F5DED9F-6FAA-4E4F-8B0D-2F467F0B6FBC",
onDataChangeMethodID:"F4AF9D45-4488-4EEB-A755-B67ABEFE085B",
onFocusGainedMethodID:"-1",
selectOnEnter:true,
size:"50,20",
tabSeq:1,
text:"Cod Ditta",
typeid:4,
uuid:"84CB688A-2AAC-4E76-9B8C-7A99D558CB7E"
},
{
anchors:6,
location:"430,150",
mediaOptions:2,
name:"btn_confermaselgiorn",
onActionMethodID:"4F5DED9F-6FAA-4E4F-8B0D-2F467F0B6FBC",
onDoubleClickMethodID:"-1",
onRightClickMethodID:"-1",
rolloverCursor:12,
showClick:false,
size:"30,30",
styleClass:"btn_confirm_40",
tabSeq:-2,
transparent:true,
typeid:7,
uuid:"870213CB-E9CA-4125-967A-DB4DE55FAB22"
},
{
formIndex:13,
labelFor:"fld_categoriarichiesta",
location:"10,40",
mediaOptions:14,
name:"lbl_categoriarichiesta",
size:"150,20",
text:"Categoria richiesta",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"8C8DDA2C-0DE2-4267-B520-48AA784C0174"
},
{
dataProviderID:"vGruppoLavoratori",
displayType:2,
editable:false,
formIndex:4,
location:"240,60",
name:"fld_gruppolavoratori",
onDataChangeMethodID:"C96961F6-777A-4B64-A0B9-F544814891FF",
size:"250,20",
tabSeq:6,
typeid:4,
uuid:"A5DC4622-0BAD-43EB-8534-6452D7022BBF",
valuelistID:"8909B17D-0562-42D0-895C-5BF85D3EF966"
},
{
dataProviderID:"vCodGruppoLavoratori",
formIndex:1,
horizontalAlignment:0,
location:"171,60",
name:"fld_codgruppolavoratori",
onActionMethodID:"4F5DED9F-6FAA-4E4F-8B0D-2F467F0B6FBC",
onDataChangeMethodID:"E2F50D42-2FB2-4D66-852C-7C12D0914E12",
size:"50,20",
tabSeq:5,
typeid:4,
uuid:"A697E504-8F70-4A6C-B07F-EA3E8916CC00"
},
{
extendsID:"3ABA8076-CC29-4C23-B357-37158AFA11D6",
formIndex:1,
location:"20,190",
size:"480,20",
typeid:7,
uuid:"A915B221-3E85-4A5D-AD43-BE9295E2C5E5"
},
{
formIndex:14,
labelFor:"fld_ragionesociale",
location:"80,0",
mediaOptions:14,
name:"lbl_ragionesociale",
size:"100,20",
text:"Ragione sociale",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"B9EA3006-4118-4B78-9EDF-D6F263DD4B33"
},
{
formIndex:16,
labelFor:"fld_mese",
location:"340,0",
mediaOptions:14,
name:"lbl_mese",
size:"150,20",
text:"Periodo cedolino",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"C54A40B9-B483-42C2-8DC2-1322B8639E0E"
},
{
formIndex:15,
labelFor:"fld_codditta",
location:"10,0",
mediaOptions:14,
name:"lbl_codice",
size:"45,20",
text:"Codice",
toolTipText:"i18n:sampleuse_navigation.anagrafica_ditta_tab_dati.label_1073742125.toolTipText",
transparent:true,
typeid:7,
uuid:"CCC5E9A3-5998-40E7-B472-E73D4792D132"
},
{
extendsID:"6B6DE138-9200-412A-B457-A03880CD4042",
formIndex:2,
location:"2,192",
tabSeq:-2,
typeid:7,
uuid:"F5101425-0B31-488E-A88C-A33E78232A6B"
}
],
name:"pv_seleziona_richiesta_dtl",
size:"500,210",
styleName:"leaf_style",
typeid:3,
uuid:"D64E47EE-478F-4B16-9018-E3ACD09903E0"