jBPM Web Designer with Migration Tooling integration on OpenShift Express
=========================================================================
Installing the jBPM Migration tool on OpenShift was never easier!

This git repository helps you get up and running quickly with the jBPM
Migration Tooling as integrated with the Web Designer.


Running on OpenShift
----------------------

Create an account at http://openshift.redhat.com/

Create a jbossas-7.0 application

    rhc app create -a editor -t jbossas-7.0

Add this upstream openshift-webdesigner-jbpmmigration repo

    cd editor
    git remote add upstream -m master git://github.com/eschabell/openshift-webdesigner-jbpmmigration.git
    git pull -s recursive -X theirs upstream master
    # note that the git pull above can be used later to pull updates to jbpmmigration
    
Then push the repo upstream

    git push

That's it, you can now checkout your application at:

    http://editor-$your_domain.rhcloud.com/designer/editor?profile=jbpm&uuid=123

USAGE NOTES:

See blog entry for details and ready to cut&paste process definitions that can be
used to test your installation: 

http://www.schabell.org/2011/10/jbpm-web-designer-integrates-jbpm.html

