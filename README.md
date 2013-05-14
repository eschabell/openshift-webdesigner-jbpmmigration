jBPM Web Designer with Migration Tooling integration on OpenShift Express
=========================================================================
Installing the jBPM Migration tool on OpenShift was never easier!

This git repository helps you get up and running quickly with the jBPM
Migration Tooling as integrated with the Web Designer.


Running on OpenShift
----------------------

Create an account at http://openshift.redhat.com/

Create a jbossas-7.0 application

    rhc app create -t jbossas-7 --from-code git://github.com/eschabell/openshift-webdesigner-jbpmmigration.git editor

That's it, you can now checkout your application at:

    http://editor-$your_domain.rhcloud.com/designer/editor?profile=jbpm&uuid=123

USAGE NOTES:

See blog entry for details and ready to cut&paste process definitions that can be
used to test your installation: 

http://www.schabell.org/2011/10/jbpm-web-designer-integrates-jbpm.html

