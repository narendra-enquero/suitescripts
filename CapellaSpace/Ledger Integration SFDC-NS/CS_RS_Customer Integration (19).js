/*
 **************************************************************************************                                                  
 ** Description:This script is defined to create customer record in NetSuite 
 **                       
 ** @author: Narendra Techmantra
 ** @dated:  23-05-2022
 ** @version: 1.0
 ** @Function:doPost ()
 **************************************************************************************
 */
/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 define(['N/record','N/url','N/config','N/runtime','N/search','N/format','N/email'],
 function(record,url,config,runtime,search,format,email) {
function doPost(requestBody)
{
 log.audit({ title: 'requestBody',details: requestBody});

 // Getting the Notification DL from the company preferences.

 var configRecObj = config.load({type: config.Type.COMPANY_PREFERENCES}).getValue('custscript_email_notifications_customer');
 var senderEmail= config.load({type: config.Type.COMPANY_PREFERENCES}).getValue('custscript_sfdc_email_author');
 if(validate(configRecObj))
 {
   configRecObj=configRecObj.split(',');
 }

 try
 {
   /* Validating the payload */

   if(validate(requestBody))
   {
	 var subsidiary=runtime.getCurrentScript().getParameter({name: 'custscript_customer_subsidiary'});
	 var responseData=createCustomer(requestBody,subsidiary,senderEmail);
		 log.audit({ title: 'responseData',details: responseData});
	 return responseData;
   }
   else
   {
	 // Throwing the error in case of invalid payload
	 var temp={};
	 temp['entityResult']='error';
	 temp['netsuiteError']='Invalid Json'; 

	 // email notification logic in case of errors

	 sendErrorNotification(temp,configRecObj,senderEmail);
	 return temp;
   }
 }
 catch(error)
 {
   log.error('error',error);
   var temp={};
   temp['entityResult']='error';
   temp['netsuiteError']=error.message;
   sendErrorNotification(temp,configRecObj,senderEmail);
   return temp;
 }
}

//  function to handle the create/update operation of netsuite customer

function createCustomer(requestBody,subsidiary)
{
 try{
 var id=requestBody.id;
 var name=requestBody.name;
 var netsuiteId=requestBody.netSuiteInternalID;
 var accountId=requestBody.Id;
 var relationship=requestBody.relationship;
 var customerSuccessManager = requestBody.csmName;
 var invoice_Instructions = requestBody.accountInvoicingInstructions;
 var resellerAccount=requestBody.resellerAccount;
 var subReseller=requestBody.subReseller;
 var region=requestBody.region; 
 var email=requestBody.email;
 var phone=requestBody.phone;
 var fax=requestBody.fax;
 var ownerId=requestBody.ownerName;
 var Customer_Success_Manager__c=requestBody.customerSuccessManager;
 var marketVertical=requestBody.vertical;
 var accountAlias=requestBody.accountAlias;
 var deniedTerritory=requestBody.deniedTerritory;
 var partnershipStartDate=requestBody.partnershipStartDate;
 var partnershipEndDate=requestBody.partnershipEndDate;
 var resellerCommitment=requestBody.resellerCommitment;
 var exclusivity=requestBody.exclusivity;
 var insideTerritoryDiscount=requestBody.insideTerritoryDiscount;
 var outsideTerritoryDiscount=requestBody.outsideTerritoryDiscount;
 var insideTerritory=requestBody.insideTerritory;
 var resellerTarget=requestBody.resellerTarget;
 var parentId=requestBody.parentId;
 var deniedTerritory=requestBody.deniedTerritory;
 var ledgerEnabled=requestBody.ledgerEnabled;
 var uSGPM=requestBody.uSGPM;

 // Validating & Lookup for internaldid on the relationship

 if(validate(relationship))
   relationship=resellerEndUser(relationship)

   //Validating the netsuite url and appends the http:// in case if it is missing

   var ns_url=requestBody.website;
 if(validate(ns_url))
   ns_url=formatURL(ns_url);

 if(!(validate(netsuiteId)))
 {
   log.audit('Creating the Customer')
   var customerObj = record.create({ type: record.Type.CUSTOMER, isDynamic: true }) //Create a new customer obj if the netsuiteId is null
 } 
 else
 {
   log.audit('Updating the customer: '+netsuiteId)
   var customerObj =record.load({ type: record.Type.CUSTOMER,id:netsuiteId,isDynamic: true })//Loading the netsuite customer if the netsuiteid is not null
 } 


 // Setting the customer field values 

 if(validate(partnershipStartDate))
   partnershipStartDate=format.parse({value:partnershipStartDate, type: format.Type.DATE});

 if(validate(partnershipEndDate))
   partnershipEndDate=format.parse({value:partnershipEndDate, type: format.Type.DATE});

 if(validate(name))
   customerObj.setValue({fieldId: 'companyname',value: name,ignoreFieldChange: true});
 customerObj.setValue({fieldId: 'isperson',value: 'F',ignoreFieldChange: true});
 if(validate(subsidiary))
   customerObj.setValue({fieldId: 'subsidiary',value: subsidiary,ignoreFieldChange: true}); 
 if(validate(email))
   customerObj.setValue({fieldId: 'email',value: email,ignoreFieldChange: true});
 if(validate(phone))
   customerObj.setValue({fieldId: 'phone',value: phone,ignoreFieldChange: true});
 //if(validate(fax))
 //  customerObj.setValue({fieldId: 'fax',value: fax,ignoreFieldChange: true}); 
 if(validate(uSGPM))
   customerObj.setText({fieldId: 'custentity_customer_entity_usg_pm',text: uSGPM,ignoreFieldChange: true}); 
 if(validate(region))
   customerObj.setValue({fieldId: 'custentity_cp_region',value: region,ignoreFieldChange: true}); 
 if(validate(invoice_Instructions))
   customerObj.setValue({fieldId: 'custentity_account_inv_instruction',value: invoice_Instructions,ignoreFieldChange: true}); 
 if(validate(accountId))
   customerObj.setValue({fieldId: 'custentity_cs_sfdc_acc_id',value: accountId,ignoreFieldChange: true});
 if(validate(ns_url))
   customerObj.setValue({fieldId: 'url',value: ns_url,ignoreFieldChange: true});
 if(validate(marketVertical))
   customerObj.setText({fieldId: 'custentitycapella_cs_market_value',text: marketVertical,ignoreFieldChange: true});
 if(validate(customerSuccessManager))
   customerObj.setText({fieldId: 'custentitycapella_cs_customer_succmgr',text: customerSuccessManager,ignoreFieldChange: true});
 if(validate(id))
   customerObj.setValue({fieldId: 'custentity_cs_sfdc_acc_id',value: id,ignoreFieldChange: true});
 if(validate(ownerId))
   customerObj.setValue({fieldId: 'custentitycapella_cs_cust_acct_owner',value: ownerId,ignoreFieldChange: true});
 if(validate(Customer_Success_Manager__c))
   customerObj.setValue({fieldId: 'custentitycapella_cs_customer_succmgr',value: Customer_Success_Manager__c,ignoreFieldChange: true});
 if(validate(relationship))
   customerObj.setValue({fieldId: 'custentity_cp_relationship',value: relationship,ignoreFieldChange: true});
 if(validate(resellerCommitment))
   customerObj.setValue({fieldId: 'custentity_cp_reseller_comtment',value: resellerCommitment,ignoreFieldChange: true});
 if(validate(insideTerritoryDiscount))
   customerObj.setValue({fieldId: 'custentity_cp_inside_territory_discount',value: insideTerritoryDiscount,ignoreFieldChange: true});
 if(validate(outsideTerritoryDiscount))
   customerObj.setValue({fieldId: 'custentity_cp_outside_territory_discount',value: outsideTerritoryDiscount,ignoreFieldChange: true});
 if(validate(insideTerritory))
   customerObj.setValue({fieldId: 'custentity_cp_inside_territory',value: insideTerritory,ignoreFieldChange: true});
 if(validate(resellerTarget))
   customerObj.setValue({fieldId: 'custentity_cp_reseller_target',value: resellerTarget,ignoreFieldChange: true});
 if(validate(exclusivity))
   if(exclusivity=="T" || exclusivity==true || exclusivity=='yes' || exclusivity=='Yes')
	 customerObj.setValue({fieldId: 'custentity_cp_exclusivity',value: true,ignoreFieldChange: true});
 if(validate(partnershipStartDate))
   customerObj.setValue({fieldId: 'custentity_cp_partshp_startdate',value: partnershipStartDate,ignoreFieldChange: true});
 if(validate(partnershipEndDate))
   customerObj.setValue({fieldId: 'custentity_cp_partshp_enddate',value: partnershipEndDate,ignoreFieldChange: true});
 if(validate(deniedTerritory))
   customerObj.setText({fieldId: 'custentity_cp_exclude_territories',text: deniedTerritory,ignoreFieldChange: true});
 if(validate(ledgerEnabled)){
   customerObj.setValue({fieldId: 'custentity_ledger_enabled',value: true,ignoreFieldChange: true});
 }
 else
 {
   customerObj.setValue({fieldId: 'custentity_ledger_enabled',value: false,ignoreFieldChange: true});
 }

//    function to add /delete/ update addressLines.

 customerObj=addAddressLines(customerObj,requestBody)

//    Saving the customer record
 var customerId= customerObj.save(true,false);


 // Logic to return the netsuite ID if the customer is created/updated sucessfully
 if (validate(customerId))
 {
   var recordUrl = url.resolveRecord({recordType:'customer',recordId:customerId});
   var domainurl = url.resolveDomain({hostType: url.HostType.APPLICATION,accountId: config.load({ type: config.Type.COMPANY_INFORMATION}).getValue('companyid')});
   var addressId= returnAddressId(customerId);
   var returnJson={};
   returnJson['entityResult']='Success';
   returnJson['netsuiteId']=customerId;
   returnJson['url'] ='https://'+domainurl+recordUrl;
   for(var x in Object.keys(addressId))
	 returnJson[Object.keys(addressId)[x]]=addressId[Object.keys(addressId)[x]];
   return returnJson;
 }
}
catch(error)
{
 log.error('error in customer create function',error);
 throw error;
}
}
function validate(temp)
{
 if(temp!='' && temp!=null && temp!=undefined && temp!="null")
 {
   if(typeof (temp)=='object')
   {
	 if(Object.keys(temp).length>0)  
	   return true
	   else
		 return false
   }
   else
	 return true
 }
}
function resellerEndUser(temp)
{
 try{
 temp=temp.replace("’","'");  // Replacing the special characters.
 var customlist_releationshipSearchObj = search.create({type: "customlist_releationship",filters:[["name","is",temp]], columns:["internalid"]});
 var searchResult = customlist_releationshipSearchObj.run().getRange({ start: 0, end: 100});
 if(searchResult.length>0)
   return searchResult[0].getValue('internalid');
}catch(error)
{
 log.error('Error in ResellerEndUser function',error);
 throw error;
}
}
function addAddressLines(customerObj,requestBody)
{
 try{
 var billingCity=requestBody.billingCity;
 var billingCountryCode=requestBody.billingCountryCode;
 var billingStreet=requestBody.billingStreet;
 var billingPostalCode=requestBody.billingPostalCode;
 var billingStateCode=requestBody.billingStateCode;
 var billingState=requestBody.billingState;

 var shippingCity=requestBody.shippingCity;
 var shippingCountryCode=requestBody.shippingCountryCode;
 var shippingStreet=requestBody.shippingStreet;
 var shippingPostalCode=requestBody.shippingPostalCode;
 var shippingStateCode=requestBody.shippingStateCode;
 var shippingState=requestBody.shippingState;

 var name=requestBody.name;
 var netsuiteShippingAddressId=requestBody.netsuiteShippingAddressId;
 var netsuiteBillingAddressId=requestBody.netsuiteBillingAddressId;

 var shippingAddressFlag=false;
 var billingAddressFlag=false;

 if(validate(billingCountryCode))
   billingAddressFlag=true

   if(validate(shippingCountryCode))
	 shippingAddressFlag=true;

 log.audit('billingAddressFlag',billingAddressFlag);
 log.audit('shippingAddressFlag',shippingAddressFlag);


//    if creating a new customer, proceed with adding new address lines
 if(!validate(requestBody.netSuiteInternalID))
 {  
  // log.audit('adding new address Lines')
   if(billingAddressFlag)customerObj=addAddressLine(customerObj,name,billingCountryCode,billingCity,billingStateCode,billingPostalCode,billingStreet,true,false,false)
   if(shippingAddressFlag)customerObj=addAddressLine(customerObj,name,shippingCountryCode,shippingCity,shippingStateCode,shippingPostalCode,shippingStreet,false,true,false)
 }
 //Logic to add/delete/update the lines if the customer is already existent in netsuite
 else
 {
   if(!(validate(netsuiteBillingAddressId)) && billingAddressFlag)customerObj=addAddressLine(customerObj,name,billingCountryCode,billingCity,billingStateCode,billingPostalCode,billingStreet,true,false,false)
   if((validate(netsuiteBillingAddressId)) && billingAddressFlag)customerObj=updateAddressLine(customerObj,name,billingCountryCode,billingCity,billingStateCode,billingPostalCode,billingStreet,true,false,false,netsuiteBillingAddressId)
   if((validate(netsuiteBillingAddressId)) && (!(billingAddressFlag)))customerObj=updateAddrLineDefault(customerObj,name,billingCountryCode,billingCity,billingStateCode,billingPostalCode,billingStreet,true,false,false,netsuiteBillingAddressId)

   if(!(validate(netsuiteShippingAddressId)) && shippingAddressFlag)customerObj=addAddressLine(customerObj,name,shippingCountryCode,shippingCity,shippingStateCode,shippingPostalCode,shippingStreet,false,true,false)
   if((validate(netsuiteShippingAddressId)) && shippingAddressFlag)customerObj=updateAddressLine(customerObj,name,shippingCountryCode,shippingCity,shippingStateCode,shippingPostalCode,shippingStreet,false,true,false,netsuiteShippingAddressId)
   if((validate(netsuiteShippingAddressId)) && (!(shippingAddressFlag)))customerObj=updateAddrLineDefault(customerObj,name,shippingCountryCode,shippingCity,shippingStateCode,shippingPostalCode,shippingStreet,false,true,false,netsuiteShippingAddressId)
 }
 return customerObj;
}
catch(error)
{
 log.error('error in addAddressLine function',error);
 throw error;
}
}
//  Returns the address subrecord id for customer
function returnAddressId(customer)
{
 try{
 var objRecord = record.load({type: record.Type.CUSTOMER,id: customer});
 var numLines = objRecord.getLineCount({sublistId: 'addressbook'});
 var tempAddr={};
 for(var xs=0;xs<numLines;xs++)
 {
   var defaultBilling=objRecord.getSublistValue('addressbook','defaultbilling',xs);
   tempAddr['billingAddressId']=null;
   if(defaultBilling)
   {
	 tempAddr['billingAddressId']=objRecord.getSublistValue('addressbook','internalid',xs);
	 break;
   }
 }
 for(var xs=0;xs<numLines;xs++)
 {
   var defaultBilling=objRecord.getSublistValue('addressbook','defaultshipping',xs);
   tempAddr['shippingAddressId']=null;
   if(defaultBilling)
   {
	 tempAddr['shippingAddressId']=objRecord.getSublistValue('addressbook','internalid',xs);
	 break;
   }
 }
 return tempAddr;
}
catch(error)
{
 log.error('error in returnAddressId function');
 throw error;
}
}
function addAddressLine(customerObj,name,CountryCode,City,StateCode,PostalCode,Street,defaultbilling,defaultshipping,isresidential)
{
 try{
 log.audit('adding new addres lines')
 customerObj.selectNewLine({sublistId: 'addressbook'});
 customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling',value: defaultbilling}); 
 customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping',value: defaultshipping}); 
 customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'isresidential',value: isresidential});
 var subrec = customerObj.getCurrentSublistSubrecord({ sublistId: 'addressbook',fieldId: 'addressbookaddress' });
 subrec.setValue({ fieldId: 'country',value: CountryCode}); 
 subrec.setValue({fieldId: 'city', value:  City});  
 subrec.setValue({fieldId: 'state',value: StateCode});
 subrec.setValue({fieldId: 'zip', value: PostalCode}); 
 subrec.setValue({fieldId: 'addr1', value: Street }); 
 subrec.setValue({ fieldId: 'addr2', value: '' }); 
 subrec.setValue({ fieldId: 'addressee',value: name}); 
 subrec.setValue({ fieldId: 'attention',value: ''}); 
 customerObj.commitLine({sublistId: 'addressbook'}); 
 return customerObj;
}
catch(error)
{
 log.error('error in addAddressLine function',error);
 throw error;
}
}
function updateAddrLineDefault(customerObj,name,CountryCode,City,StateCode,PostalCode,Street,defaultbilling,defaultshipping,isresidential,addressId)
{
 try{
 log.audit('Updating the address defaults');
 var lineNumber=customerObj.findSublistLineWithValue({sublistId: 'addressbook',fieldId: 'addressid',value: addressId});
 if(lineNumber>=0)
 {
   customerObj.selectLine({ sublistId: 'addressbook',line: lineNumber});
   customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling',value: false}); 
   customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping',value: false}); 
   customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'isresidential',value: false});
   customerObj.commitLine({sublistId: 'addressbook'}); 
 }
 return customerObj;
}
catch(error)
{
 log.error('error in updateAddrLineDefault',error);
 throw error;
}
}
function updateAddressLine(customerObj,name,CountryCode,City,StateCode,PostalCode,Street,defaultbilling,defaultshipping,isresidential,addressId)
{
 try{
 log.audit('Updating The Addres line'+addressId);
 var lineNumber=customerObj.findSublistLineWithValue({sublistId: 'addressbook',fieldId: 'addressid',value: addressId});
 if(lineNumber>=0){
   customerObj.selectLine({ sublistId: 'addressbook',line: lineNumber});
   customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling',value: defaultbilling}); 
   customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping',value: defaultshipping}); 
   customerObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'isresidential',value: isresidential});
   var subrec = customerObj.getCurrentSublistSubrecord({ sublistId: 'addressbook',fieldId: 'addressbookaddress' });
   subrec.setValue({ fieldId: 'country',value: CountryCode}); 
   subrec.setValue({fieldId: 'city', value:  City});  
   subrec.setValue({fieldId: 'state',value: StateCode});
   subrec.setValue({fieldId: 'zip', value: PostalCode}); 
   subrec.setValue({fieldId: 'addr1', value: Street }); 
   subrec.setValue({ fieldId: 'addr2', value: '' }); 
   subrec.setValue({ fieldId: 'addressee',value: name}); 
   subrec.setValue({ fieldId: 'attention',value: ''}); 
   customerObj.commitLine({sublistId: 'addressbook'}); 
 }
 return customerObj;   
}catch(error)
{
 log.error('error in updateAddressLine function',error);
 throw error;
}
}
function formatURL(tempurl)
{
 try{
 if((tempurl.indexOf('http')!='-1'))
 {
   return tempurl;
 }
 else if((tempurl.indexOf('https')!='-1'))
 {
   return tempurl;
 }
 else if((tempurl.indexOf('https')!='-1'))
 {
   return tempurl;
 }
 else if((tempurl.indexOf('ftp')!='-1'))
 {
   return tempurl;
 }
 else if((tempurl.indexOf('file')!='-1'))
 {
   return tempurl;
 }
 else
 {
   tempurl='http://'+tempurl;
   return tempurl;
 }
}catch(error)
{
 log.error('Error in formatURL function',error);
 throw error;
}
}
function sendErrorNotification(temp,temp1,senderEmail)
{
 try{
   email.send({
	 author: senderEmail,   
	 recipients: temp1,
	 subject: 'Netsuite Customer API Error',
	 body: JSON.stringify(temp)
   });
 }
 catch(error)
 {
   log.error({ title: 'error in sendEmailFunction',details: error});
 }
}
return {
 post: doPost
};

});