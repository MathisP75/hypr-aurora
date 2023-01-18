
# Oracle Developer Tools for VS Code (SQL and PLSQL)
This extension enables editing and execution of SQL and PL/SQL for Oracle Database and Oracle Autonomous Database.
### Version 21.5.0  

View the [Quickstart: Get Started with Oracle and VSCode](https://docs.oracle.com/en/database/oracle/developer-tools-for-vscode/getting-started/index.html) for details on how to configure, connect and use Oracle Developer Tools for VS Code. Questions or feedback about this extension? Please post your questions or comments on the [Oracle Developer Tools forum](https://community.oracle.com/tech/developers/categories/oracle-developer-tools-for-vs-code). 

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/readmeoverview2150.png"  /> 



### Features include:
* Connect to Oracle Database and Oracle Autonomous Database using Easy Connect syntax, TNS connect aliases, or ODP.NET connection strings. Choose a default connection to make it easier when opening multiple SQL files.
* Create and manage Oracle Autonomous Databases (ADBs) using Oracle Cloud Infrastructure Explorer tree control. Create, start, stop and terminate ADB instances. Automatically create a walletless database connection or download credentials files.
* Oracle Database Explorer tree control: connect and explore Oracle schemas; show data for tables and views and save as CSV or JSON files; auto-generate CREATE, SELECT, INSERT, and DELETE statements for tables; view, edit, debug and save PL/SQL packages, procedures and functions. Run stored procedures and functions with a UI for entering parameter values. 
* Edit SQL and PL/SQL with support for hovering, Go to/Peek Definition, Go to/Peek Type Definition, Go to/Peek Implementation, and Go to/Peek/Find All References. The editor also features IntelliSense for autocompletion of schema object names, procedure/function parameters, and SQL*Plus commands. Navigate through large scripts using breadcrumbs. Format SQL and PL/SQL with a configurable formatter.
* Debug PL/SQL in stored procedures, functions, and packages using Visual Studio Code's native debugging features. Compile PL/SQL for debugging, step into PL/SQL, and run to a breakpoint. Enable External Application Debugging to listen for and debug PL/SQL procedures and functions called by applications or SQL scripts.
* Execute SQL and PL/SQL and view and save results. View errors in the Problems panel and navigate to the line with the error. Enter bind and substitution variables into a dialog.
* [Limited SQL*Plus support](https://www.oracle.com/database/technologies/appdev/dotnet/odtvscodesqlplus.html)
* View SQL command history and view and save SQL bookmarks



### Feature Highlights

#### Connection Dialog

Connect using hostname/port/service name, TNS alias, Easy Connect connection string, connect descriptor, directory server (LDAP) service name, or ODP.NET connection string. Other options include connecting with a proxy user, setting the current schema, and using a login SQL script. Choose a default connection to automatically connect when opening many SQL scripts.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/condialogez2150.png"  /> 

#### Create and manage Oracle Autonomous Databases 

Create and manage Oracle Autonomous Databases (ADBs) using the Oracle Cloud Infrastructure Explorer tree control. Create new Always Free or paid ADB instances, and start, stop, and terminate existing ADB instances. Automatically create a walletless database connection or download credentials files.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/ociexplorer2150.png"  /> 

#### Oracle Database Explorer 

Explore your database schema in a tree control. Right click on the connection name to open an existing SQL file or create a new file that uses that connection. Show table data and generate CREATE, SELECT, INSERT, or DELETE SQL for tables. View, edit, debug and run stored procedures and functions. Explore other users' schemas.


<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/explorer2140.png"  /> 

#### PL/SQL debugger

Debug PL/SQL in stored procedures, functions, and packages using Visual Studio Code's native debugging features. Compile PL/SQL for debugging, step into PL/SQL, and run to a breakpoint. Enable External Application Debugging to listen for and debug PL/SQL procedures and functions called by applications or SQL scripts.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/debugging.png"  /> 

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/debugging.gif"  /> 

#### Use IntelliSense to autocomplete schema objects 

Begin typing SQL into the editor and autocomplete suggestions will appear. Enter a schema name, schema object name, or alias followed by a period (".") to show the child objects. Enter a stored procedure or function name and autocomplete the parameter list. Modify the settings to choose whether to use upper or lower case.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/autocompletealias.png"  />

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/autocompletealias.gif"  />

In the examples below, a stored procedure will autocomplete as you type -  or you can choose to fill in a template for the call:

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/autocomplete1.png"  />

<p>

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/autocomplete2.png"  /> 

#### Navigate SQL and PL/SQL code with Hover, Go to, and Peek 

Use powerful editor features to navigate and learn more about SQL and PL/SQL objects. The editor supports hovering, Go to/Peek Definition, Go to/Peek Type Definition, Go to/Peek Implementation, and Go to/Peek/Find All References.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/hover.png"  /> 

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/peek.gif"  /> 

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/peekmenu2150.png"  /> 

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/peekscreen.png"  /> 

#### Navigate through scripts using breadcrumbs

Use breadcrumbs to easily navigate through large scripts.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/breadcrumbs.png"  /> 


#### SQL and PL/SQL formatter with configurable settings

Format SQL and PL/SQL via a single click on the toolbar. The formatter settings offer a wide variety of options.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/formatter.png"  /> 

#### View table data and save as CSV or JSON

View the results of queries in a grid and save the results in CSV or JSON format.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/datagrid2130.png"  /> 

#### Problems panel integration

Errors encountered when running SQL scripts or when saving PL/SQL to the database are placed in the Problems panel.  Clicking on the error takes you to the line in the script where the error occurred.

<img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/problems.png"  /> 

#### Code snippets

Code snippets provide example templates for various SQL commands. They are shown when you type 'oracle':

 <img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/codesnippets.png"  /> 

#### Test stored procedures and functions

Use the Oracle Database Explorer "Run" menu item to run a procedure or function, enter input parameters and view output parameters. If the output parameter is a cursor, you can fetch and display the results.

 <img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/testproc2140.png"  /> 

#### Bookmarks and history

Save SQL and PL/SQL as "bookmarks" which can later be executed or added to SQL scripts. SQL history is stored for a Visual Studio Code session and can be run, added to scripts, and/or saved as a bookmark.

 <img src="https://raw.githubusercontent.com/oracle/dotnet-db-samples/master/session-demos/2019/odtvscodescreenshots/bookmarks.png"  /> 



### Changes in version 21.5.0
* Default Oracle Explorer database connection can be selected for use when running SQL scripts. This is useful when opening folders containing many SQL scripts
* Login script can be run each time a connection is established. This could be used to alter session settings to modify NLS parameters, etc
* SQL and PL/SQL formatter with configurable settings
* Create walletless connections to Oracle Autonomous Database 
* Get connection strings to connect to Oracle Autonomous Database
* Update network access control list (ACL) for Oracle Autonomous Database
* CodeLens support for Go to References/Find All References for PL/SQL Code objects opened from an Oracle Explorer connection
* Code folding improvements
* Improved IntelliSense (auto complete) suggestions for SQL and PL/SQL statements
* Improved efficiency of the database connection used by IntelliSense
* .NET Runtime is now automatically installed if no compatible runtime is currently installed 




Please refer to the [Licensing Information User Manual for Oracle Developer Tools for VS Code](https://docs.oracle.com/en/database/oracle/oracle-data-access-components/licensing_guides.html) for additional licensing information including third-party notices and/or licenses.

 Copyright (c) 2022, Oracle and/or its affiliates. 
