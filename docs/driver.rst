Driver API
==========
The Normandy driver is an object passed to all actions when they are created. It
provides methods and attributes for performing operations that require more
privileges than JavaScript is normally given. For example, the driver might
provide a function for showing a notification bar within the Firefox UI,
something normal JavaScript can't trigger.

Environments in which actions are run (such as the `Normandy system add-on`_)
implement the driver and pass it to the actions before executing them. The
driver is versioned, and the version of this documentation corresponds to the
version of the driver that it documents.

.. _Normandy system add-on: https://github.com/mozilla/normandy-addon

Driver
------
The driver object contains the following attributes:

.. js:data:: testing

   Boolean describing whether the action is being executed in "testing" mode.
   Testing mode is mainly used when previewing recipes within the Normandy
   admin interface.

.. js:function:: log(message, testOnly=true)

   Log a message to an appropriate location. It's up to the driver where these
   messages are stored; they could go to the browser console, or to a remote
   logging service, or somewhere else. By default, messages are only logged in
   testing mode.

   :param message: Message to log
   :param testOnly: If true, only log the message in testing mode. Default true.

.. js:function:: showHeartbeat(options)

   Displays a Heartbeat survey to the user. Appears as a notification bar with
   a 5-star rating input for users to vote with. Also contains a "Learn More"
   button on the side. After voting, users are shown a thanks message and
   optionally a new tab is opened to a specific URL.

   :param message: Primary message to display alongside rating stars.
   :param thanksMessage: Message to show after user submits a rating.
   :param flowId: A UUID that should be unique to each call to this function.
      Used to track metrics related to this user interaction.
   :param postAnswerUrl: URL to show users after they submit a rating. If empty,
      the user won't be shown anything.
   :param learnMoreMessage: Text to show on the "Learn More" button.
   :param learnMoreUrl: URL to open when the "Learn More" button is clicked.
   :returns: A Promise that resolves once the Heartbeat notification has been
      shown, or rejects if Heartbeat is unavailable for some reason.

.. js:function:: getAppInfo()

   Retrieves information about the client application:

   ``defaultUpdateChannel``
      The update channel that Firefox is set to. Valid values include, but are
      not limited to:

      * ``'release'``
      * ``'aurora'``
      * ``'beta'``
      * ``'nightly'``
      * ``'default'`` (self-built or automated testing builds)

   ``defaultBrowser``
      Boolean describing if Firefox is set as the default browser.
   ``version``
      String containing the Firefox version.

   :returns: A Promise that resolves with an object containing the application
      info.

.. js:function:: uuid()

   Generates a v4 UUID. The UUID is randomly generated.

   :returns: String containing the UUID.

.. js:function:: createStorage(keyPrefix)

   Creates a storage object that can be used to store data on the client.

   :param keyPrefix: Prefix to append to keys before storing them, to avoid
      collision with other actions using the storage.
   :returns: :js:class:`Storage`

Storage
-------
.. js:class:: Storage

   Storage objects allow actions to store data locally on the client, using an
   API that is similar to localStorage, but is asynchronous.

   .. js:function:: getItem(key)

      Retrieves a value from storage.

      :param key: Key to look up in storage.
      :returns: A Promise that resolves with the value found in storage, or
         ``null`` if the key doesn't exist.

   .. js:function:: setItem(key, value)

      Inserts a value into storage under the given key.

      :param key: Key to insert the value under.
      :param value: Value to store.
      :returns: A Promise that resolves when the value has been stored.

   .. js:function:: removeItem(key)

      Removes a value from storage.

      :param key: Key to remove.
      :returns: A Promise that resolves when the value has been removed.
