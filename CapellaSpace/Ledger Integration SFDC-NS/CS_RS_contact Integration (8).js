/*
 **************************************************************************************                                                  
 ** Description:This script is defined to create contact record in NetSuite 
 **                       
 ** @author: Narendra Techmantra
 ** @dated:  23-05-2022
 ** @version: 1.0
 ** @Function: doPost()
 **************************************************************************************
 */
/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 define(['N/record','N/url','N/config','N/runtime','N/email'],
 function(record,url,config,runtime,email) {
function doPost(requestBody){
 log.audit({ title: 'requestBody',details: requestBody });

 // Getting the Notification DL from the company preferences.

 var configRecObj = config.load({type: config.Type.COMPANY_PREFERENCES}).getValue('custscript_notification_email_contact');
 var senderEmail= config.load({type: config.Type.COMPANY_PREFERENCES}).getValue('custscript_sfdc_email_author');
 if(validate(configRecObj))
 {
   configRecObj=configRecObj.split(',');
 }
 try{
   if(validate(requestBody)){
	 //Getting the subsidiary value from the script parameters
	 var subsidiary=runtime.getCurrentScript().getParameter({name: 'custscript_contact_subsidiary'});
	 var responseData=createContact(requestBody,subsidiary);
	log.audit({ title: 'responseData',details: responseData });
	 return responseData
   }
   else{
	 var temp={};
	 temp['entityResult']='error';
	 temp['netsuiteError']='Invalid Json';
	 sendErrorNotification(temp,configRecObj,senderEmail);
	 return temp;
   }
 }catch(error)
 {
   log.error('error doPost',error);
   var temp={};
   temp['entityResult']='error';
   temp['netsuiteError']=error.message;
   sendErrorNotification(temp,configRecObj,senderEmail);
   return temp
 }   
}

// function to create/udpate the contact record based on netsuite id from the payload
function createContact(requestBody,subsidiary)
{
 try{
 var id=requestBody.id;
 var firstName=requestBody.firstName;
 var lastName=requestBody.lastName;
 var salutation=requestBody.salutation;
 var phone=requestBody.phone;
 var mobilePhone=requestBody.mobilePhone;
 var email=requestBody.email;
 var title=requestBody.title;
 var netsuiteId=requestBody.netsuiteId;
 var accountNetsuiteId=requestBody.accountNetsuiteId;
 var isBillingContact=requestBody.isBillingContact;
 var isMainContact=requestBody.isMainContact;


 var primarycontactflag=false;

 // flag to deterimine if the the primary/ billing contact are same or not ?

 if((isMainContact==true)||(isBillingContact==true && isMainContact==true))
   primarycontactflag=true;
 if(validate(netsuiteId))
 {
   var contactObj = record.load({ type: record.Type.CONTACT, id: netsuiteId,isDynamic: true});  // loading the existing contact record
 }
 else
 {
   var contactObj = record.create({ type: record.Type.CONTACT,isDynamic: true});  // creating the new contact record obj
 }
 if(validate(firstName))
   contactObj.setValue('firstname',firstName);
 if(validate(lastName))
   contactObj.setValue('lastname',lastName);
 if(validate(phone))
   contactObj.setValue('officephone',phone);
 if(validate(mobilePhone))
   contactObj.setValue('mobilephone',mobilePhone);
 if(validate(email))
   contactObj.setValue('email',email);
 if(validate(title))
   contactObj.setValue('title',title);
 if(validate(salutation))
   contactObj.setValue('salutation',salutation);
 if(validate(subsidiary))
   contactObj.setValue('subsidiary',subsidiary);

 var contactId= contactObj.save(true,false);

 var returnJson={};
 if (validate(contactId))
 {
   var recordUrl = url.resolveRecord({ recordType: 'contact', recordId: contactId});
   var domainurl = url.resolveDomain({hostType: url.HostType.APPLICATION,accountId: config.load({ type: config.Type.COMPANY_INFORMATION}).getValue('companyid')});
   returnJson['entityResult']='Success';
   returnJson['netsuiteId']=contactId;
   returnJson['url'] ='https://'+domainurl+recordUrl;

   // Upon the contact creation we are linking the contact record with customer record under (primary & Billing) roles based on the flag

   if(validate(accountNetsuiteId))
   {
	 if(primarycontactflag)
	 {
	   var recAttach=record.attach({record: { type: 'contact',id: contactId},to: { type: 'customer',id: accountNetsuiteId}, attributes: {role: '-10'}});
	   if(isMainContact)
		 record.submitFields({type: 'customer',  id: accountNetsuiteId, values: {'email': email}});
	 }
	 else{
	   var recAttach=record.attach({record: { type: 'contact',id: contactId},to: { type: 'customer',id: accountNetsuiteId}, attributes: {role: '1'}});
	 }
   }
   return returnJson;
 }
}
catch(error)
{
 log.error('Error in Create Contact',error);
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
function sendErrorNotification(temp,temp1,senderEmail)  // add email validations, try catch block
{
 try{
   email.send({
	 author: senderEmail,   
	 recipients: temp1,
	 subject: 'Netsuite Contact API Error',
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