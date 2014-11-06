AC_PREREQ([2.63])
AC_INIT([eos-license-service], [1.0.0], [cosimo@endlessm.com], [eos-license-service], [http://www.endlessm.com/])
AC_CONFIG_HEADER([config.h])
AC_CONFIG_MACRO_DIR([m4])

AM_INIT_AUTOMAKE([1.11 -Wno-portability foreign no-define tar-ustar no-dist-gzip dist-xz])
AM_MAINTAINER_MODE([enable])
AM_SILENT_RULES([yes])

PKG_PROG_PKG_CONFIG
AC_PROG_MKDIR_P
AC_PATH_PROG([UNOCONV], [unoconv])

# systemd
AC_ARG_WITH([systemdsystemunitdir],
            AS_HELP_STRING([--with-systemdsystemunitdir=DIR], [Directory for systemd service files]),
	    [],
	    [with_systemdsystemunitdir=$($PKG_CONFIG --variable=systemdsystemunitdir systemd)])
AC_SUBST([systemdsystemunitdir], [$with_systemdsystemunitdir])

AC_CONFIG_FILES([
Makefile
])
AC_OUTPUT

echo "
    Endless license service $VERSION
"
